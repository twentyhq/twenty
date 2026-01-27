import { Injectable, Logger } from '@nestjs/common';

import { parse } from 'path';

import {
  ApplicationManifest,
  FieldManifest,
  ObjectExtensionManifest,
  ObjectManifest,
  RelationFieldManifest,
  RoleManifest,
  ServerlessFunctionManifest,
  ServerlessFunctionTriggerManifest,
} from 'twenty-shared/application';
import { FieldMetadataType, HTTPMethod, Sources } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { ApplicationInput } from 'src/engine/core-modules/application/dtos/application.input';
import { ApplicationVariableEntityService } from 'src/engine/core-modules/applicationVariable/application-variable.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntitiesByApplicationId } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entities-by-application-id.util';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { FieldPermissionService } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.service';
import { ObjectPermissionService } from 'src/engine/metadata-modules/object-permission/object-permission.service';
import { PermissionFlagService } from 'src/engine/metadata-modules/permission-flag/permission-flag.service';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';
import { ServerlessFunctionLayerService } from 'src/engine/metadata-modules/serverless-function-layer/serverless-function-layer.service';
import { ServerlessFunctionV2Service } from 'src/engine/metadata-modules/serverless-function/services/serverless-function-v2.service';
import { FlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/types/flat-serverless-function.type';
import { computeMetadataNameFromLabelOrThrow } from 'src/engine/metadata-modules/utils/compute-metadata-name-from-label-or-throw.util';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import {
  CronTriggerSettings,
  DatabaseEventTriggerSettings,
  HttpRouteTriggerSettings,
} from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';

@Injectable()
export class ApplicationSyncService {
  private readonly logger = new Logger(ApplicationSyncService.name);

  constructor(
    private readonly applicationService: ApplicationService,
    private readonly applicationVariableService: ApplicationVariableEntityService,
    private readonly serverlessFunctionLayerService: ServerlessFunctionLayerService,
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly fieldMetadataService: FieldMetadataService,
    private readonly serverlessFunctionV2Service: ServerlessFunctionV2Service,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly dataSourceService: DataSourceService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly roleService: RoleService,
    private readonly objectPermissionService: ObjectPermissionService,
    private readonly fieldPermissionService: FieldPermissionService,
    private readonly permissionService: PermissionFlagService,
  ) {}

  public async synchronizeFromManifest({
    workspaceId,
    manifest,
    packageJson,
    yarnLock,
  }: ApplicationInput & {
    workspaceId: string;
  }) {
    const application = await this.syncApplication({
      workspaceId,
      manifest,
      packageJson,
      yarnLock,
    });

    await this.syncObjects({
      objectsToSync: manifest.objects,
      workspaceId,
      applicationId: application.id,
    });

    await this.syncRelations({
      objectsToSync: manifest.objects,
      workspaceId,
      applicationId: application.id,
    });

    if (manifest.objectExtensions && manifest.objectExtensions.length > 0) {
      await this.syncObjectExtensionsOrThrow({
        objectExtensionsToSync: manifest.objectExtensions,
        workspaceId,
        applicationId: application.id,
      });
    }

    if (manifest.functions.length > 0) {
      if (!isDefined(application.serverlessFunctionLayerId)) {
        throw new ApplicationException(
          `Failed to sync serverless function, could not find a serverless function layer.`,
          ApplicationExceptionCode.FIELD_NOT_FOUND,
        );
      }

      await this.syncServerlessFunctions({
        serverlessFunctionsToSync: manifest.functions,
        code: manifest.sources,
        workspaceId,
        applicationId: application.id,
        serverlessFunctionLayerId: application.serverlessFunctionLayerId,
      });
    }

    await this.syncRoles({
      manifest,
      workspaceId,
      applicationId: application.id,
    });

    this.logger.log('✅ Application sync from manifest completed');
  }

  private async syncApplication({
    workspaceId,
    manifest,
    packageJson,
    yarnLock,
  }: ApplicationInput & {
    workspaceId: string;
  }): Promise<ApplicationEntity> {
    const name = manifest.application.displayName ?? packageJson.name;
    const application =
      (await this.applicationService.findByUniversalIdentifier({
        universalIdentifier: manifest.application.universalIdentifier,
        workspaceId,
      })) ??
      (await this.applicationService.create({
        universalIdentifier: manifest.application.universalIdentifier,
        name,
        description: manifest.application.description,
        version: packageJson.version,
        sourcePath: 'cli-sync', // Placeholder for CLI-synced apps
        serverlessFunctionLayerId: null,
        defaultServerlessFunctionRoleId: null,
        workspaceId,
      }));

    let serverlessFunctionLayerId = application.serverlessFunctionLayerId;

    if (manifest.functions.length > 0) {
      if (!isDefined(serverlessFunctionLayerId)) {
        serverlessFunctionLayerId = (
          await this.serverlessFunctionLayerService.create(
            {
              packageJson,
              yarnLock,
            },
            workspaceId,
          )
        ).id;
      }

      await this.serverlessFunctionLayerService.update(
        serverlessFunctionLayerId,
        {
          packageJson,
          yarnLock,
        },
        workspaceId,
      );
    }

    await this.applicationVariableService.upsertManyApplicationVariableEntities(
      {
        applicationVariables: manifest.application.applicationVariables,
        applicationId: application.id,
        workspaceId,
      },
    );

    return await this.applicationService.update(application.id, {
      name,
      description: manifest.application.description,
      version: packageJson.version,
      serverlessFunctionLayerId,
      defaultServerlessFunctionRoleId: null,
    });
  }

  private async syncRoles({
    manifest,
    workspaceId,
    applicationId,
  }: {
    manifest: ApplicationManifest;
    workspaceId: string;
    applicationId: string;
  }) {
    let defaultServerlessFunctionRoleId: string | null = null;

    for (const role of manifest.roles ?? []) {
      let existingRole = await this.roleService.getRoleByUniversalIdentifier({
        universalIdentifier: role.universalIdentifier,
        workspaceId,
      });

      if (existingRole) {
        await this.roleService.updateRole({
          input: {
            id: existingRole.id,
            update: role,
          },
          workspaceId,
        });
      } else {
        existingRole = await this.roleService.createRole({
          input: role,
          workspaceId,
          applicationId,
        });
      }

      await this.syncApplicationRolePermissions({
        role,
        workspaceId,
        roleId: existingRole.id,
      });

      if (
        existingRole.universalIdentifier ===
        manifest.application.functionRoleUniversalIdentifier
      ) {
        defaultServerlessFunctionRoleId = existingRole.id;
      }
    }

    if (isDefined(defaultServerlessFunctionRoleId)) {
      await this.applicationService.update(applicationId, {
        defaultServerlessFunctionRoleId: defaultServerlessFunctionRoleId,
      });
    }
  }

  private async syncApplicationRolePermissions({
    role,
    workspaceId,
    roleId,
  }: {
    role: RoleManifest;
    workspaceId: string;
    roleId: string;
  }) {
    if (
      (role.objectPermissions ?? []).length > 0 ||
      (role.fieldPermissions ?? []).length > 0
    ) {
      const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
        await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
          {
            workspaceId,
            flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
          },
        );

      const { idByNameSingular: objectIdByNameSingular } =
        buildObjectIdByNameMaps(flatObjectMetadataMaps);

      const formattedObjectPermissions = role.objectPermissions
        ?.map((perm) => ({
          ...perm,
          objectMetadataId: isDefined(perm.objectNameSingular)
            ? objectIdByNameSingular[perm.objectNameSingular]
            : isDefined(perm.objectUniversalIdentifier)
              ? flatObjectMetadataMaps.idByUniversalIdentifier[
                  perm.objectUniversalIdentifier
                ]
              : undefined,
        }))
        .filter((perm): perm is typeof perm & { objectMetadataId: string } =>
          isDefined(perm.objectMetadataId),
        );

      if (isDefined(formattedObjectPermissions)) {
        await this.objectPermissionService.upsertObjectPermissions({
          workspaceId,
          input: {
            roleId,
            objectPermissions: formattedObjectPermissions,
          },
        });
      }

      const formattedFieldPermissions = role?.fieldPermissions
        ?.map((perm) => {
          const objectMetadataId = isDefined(perm.objectNameSingular)
            ? objectIdByNameSingular[perm.objectNameSingular]
            : isDefined(perm.objectUniversalIdentifier)
              ? flatObjectMetadataMaps.idByUniversalIdentifier[
                  perm.objectUniversalIdentifier
                ]
              : undefined;

          const fieldMetadataId = isDefined(objectMetadataId)
            ? isDefined(perm.fieldName)
              ? Object.values(flatFieldMetadataMaps.byId).find(
                  (flatField) =>
                    isDefined(flatField) &&
                    flatField.objectMetadataId === objectMetadataId &&
                    flatField.name === perm.fieldName,
                )?.id
              : isDefined(perm.fieldUniversalIdentifier)
                ? Object.values(flatFieldMetadataMaps.byId).find(
                    (flatField) =>
                      isDefined(flatField) &&
                      flatField.objectMetadataId === objectMetadataId &&
                      flatField.universalIdentifier ===
                        perm.fieldUniversalIdentifier,
                  )?.id
                : undefined
            : undefined;

          return {
            ...perm,
            objectMetadataId,
            fieldMetadataId,
          };
        })
        .filter(
          (
            perm,
          ): perm is typeof perm & {
            objectMetadataId: string;
            fieldMetadataId: string;
          } =>
            isDefined(perm.objectMetadataId) && isDefined(perm.fieldMetadataId),
        );

      if (isDefined(formattedFieldPermissions)) {
        await this.fieldPermissionService.upsertFieldPermissions({
          workspaceId,
          input: {
            roleId,
            fieldPermissions: formattedFieldPermissions,
          },
        });
      }
    }

    if (isDefined(role?.permissionFlags) && role.permissionFlags.length > 0) {
      await this.permissionService.upsertPermissionFlags({
        workspaceId,
        input: {
          roleId,
          permissionFlagKeys: role.permissionFlags,
        },
      });
    }
  }

  private isRelationFieldManifest(
    field: FieldManifest | RelationFieldManifest,
  ): field is RelationFieldManifest {
    return this.isFieldTypeRelation(field.type);
  }

  private isFieldTypeRelation(type: FieldMetadataType): boolean {
    return type === FieldMetadataType.RELATION;
  }

  private async syncFieldsWithoutRelations({
    objectId,
    fieldsToSync: allFieldsToSync,
    workspaceId,
    applicationId,
  }: {
    objectId: string;
    workspaceId: string;
    applicationId: string;
    fieldsToSync?: (FieldManifest | RelationFieldManifest)[];
  }) {
    if (!isDefined(allFieldsToSync)) {
      return;
    }

    const fieldsToSync = allFieldsToSync.filter(
      (field): field is FieldManifest => !this.isRelationFieldManifest(field),
    );

    if (fieldsToSync.length === 0) {
      return;
    }

    const { flatFieldMetadataMaps: existingFlatFieldMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatFieldMetadataMaps'],
        },
      );

    const existingFields = Object.values(
      existingFlatFieldMetadataMaps.byId,
    ).filter(
      (field) =>
        isDefined(field) &&
        field.objectMetadataId === objectId &&
        !this.isFieldTypeRelation(field.type),
    ) as FlatFieldMetadata[];

    const fieldsToSyncUniversalIds = fieldsToSync.map(
      (field) => field.universalIdentifier,
    );

    const existingFieldsStandardIds = existingFields.map(
      (field) => field.universalIdentifier,
    );

    const fieldsToDelete = existingFields.filter(
      (field) =>
        isDefined(field.universalIdentifier) &&
        !fieldsToSyncUniversalIds.includes(field.universalIdentifier) &&
        field.isCustom === true &&
        field.isSystem === false,
    );

    const fieldsToUpdate = existingFields.filter(
      (field) =>
        isDefined(field.universalIdentifier) &&
        fieldsToSyncUniversalIds.includes(field.universalIdentifier),
    );

    const fieldsToCreate = fieldsToSync.filter(
      (fieldToSync) =>
        !existingFieldsStandardIds.includes(fieldToSync.universalIdentifier),
    );

    for (const fieldToDelete of fieldsToDelete) {
      await this.fieldMetadataService.updateOneField({
        updateFieldInput: {
          id: fieldToDelete.id,
          isActive: false,
        },
        workspaceId,
      });
      await this.fieldMetadataService.deleteOneField({
        deleteOneFieldInput: { id: fieldToDelete.id },
        workspaceId,
      });
    }

    for (const fieldToUpdate of fieldsToUpdate) {
      const fieldToSync = fieldsToSync.find(
        (field) =>
          field.universalIdentifier === fieldToUpdate.universalIdentifier,
      );

      if (!fieldToSync) {
        throw new ApplicationException(
          `Failed to find field to sync with universalIdentifier ${fieldToUpdate.universalIdentifier}`,
          ApplicationExceptionCode.FIELD_NOT_FOUND,
        );
      }

      const updateFieldInput = {
        id: fieldToUpdate.id,
        label: fieldToSync.label,
        description: fieldToSync.description ?? undefined,
        icon: fieldToSync.icon ?? undefined,
        defaultValue: fieldToSync.defaultValue ?? undefined,
        options: fieldToSync.options ?? undefined,
        settings: fieldToSync.settings ?? undefined,
        isNullable: fieldToSync.isNullable ?? true,
      };

      await this.fieldMetadataService.updateOneField({
        updateFieldInput,
        workspaceId,
      });
    }

    for (const fieldToCreate of fieldsToCreate) {
      const createFieldInput: CreateFieldInput = {
        name: computeMetadataNameFromLabelOrThrow(fieldToCreate.label),
        type: fieldToCreate.type,
        label: fieldToCreate.label,
        description: fieldToCreate.description ?? undefined,
        icon: fieldToCreate.icon ?? undefined,
        defaultValue: fieldToCreate.defaultValue ?? undefined,
        options: fieldToCreate.options ?? undefined,
        settings: fieldToCreate.settings ?? undefined,
        isNullable: fieldToCreate.isNullable ?? true,
        objectMetadataId: objectId,
        universalIdentifier: fieldToCreate.universalIdentifier,
        standardId: fieldToCreate.universalIdentifier,
        applicationId,
        isCustom: true,
        workspaceId,
      };

      await this.fieldMetadataService.createOneField({
        createFieldInput,
        workspaceId,
        applicationId,
      });
    }
  }

  private async syncRelationFields({
    objectId,
    relationsToSync,
    workspaceId,
    applicationId,
    flatObjectMetadataMaps,
  }: {
    objectId: string;
    relationsToSync: RelationFieldManifest[];
    workspaceId: string;
    applicationId: string;
    flatObjectMetadataMaps: {
      idByUniversalIdentifier: Partial<Record<string, string>>;
    };
  }) {
    const { flatFieldMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatFieldMetadataMaps'],
        },
      );

    for (const relation of relationsToSync) {
      const existingRelationField = Object.values(
        flatFieldMetadataMaps.byId,
      ).find(
        (field) =>
          isDefined(field) &&
          field.universalIdentifier === relation.universalIdentifier,
      );

      if (isDefined(existingRelationField)) {
        continue;
      }

      const targetObjectId =
        flatObjectMetadataMaps.idByUniversalIdentifier[
          relation.targetObjectUniversalIdentifier
        ];

      if (!isDefined(targetObjectId)) {
        throw new ApplicationException(
          `Failed to find target object with universalIdentifier ${relation.targetObjectUniversalIdentifier}`,
          ApplicationExceptionCode.OBJECT_NOT_FOUND,
        );
      }

      const createFieldInput: CreateFieldInput = {
        name: computeMetadataNameFromLabelOrThrow(relation.label),
        type: FieldMetadataType.RELATION,
        label: relation.label,
        description: relation.description ?? undefined,
        icon: relation.icon ?? undefined,
        objectMetadataId: objectId,
        universalIdentifier: relation.universalIdentifier,
        standardId: relation.universalIdentifier,
        applicationId,
        isCustom: true,
        workspaceId,
        relationCreationPayload: {
          type: relation.relationType,
          targetObjectMetadataId: targetObjectId,
          targetFieldLabel: relation.targetFieldLabel,
          targetFieldIcon: relation.targetFieldIcon ?? 'IconRelationOneToMany',
        },
      };

      await this.fieldMetadataService.createOneField({
        createFieldInput,
        workspaceId,
        applicationId,
      });
    }
  }

  private async syncObjects({
    objectsToSync,
    workspaceId,
    applicationId,
  }: {
    objectsToSync: ObjectManifest[];
    workspaceId: string;
    applicationId: string;
  }) {
    const { flatObjectMetadataMaps: existingFlatObjectMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps'],
        },
      );

    const applicationObjects = Object.values(
      existingFlatObjectMetadataMaps.byId,
    ).filter(
      (obj) => isDefined(obj) && obj.applicationId === applicationId,
      // TODO handle when migrating to trinite usage
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) as any[];

    const objectsToSyncUniversalIds = objectsToSync.map(
      (obj) => obj.universalIdentifier,
    );

    const applicationObjectsStandardIds = applicationObjects.map(
      (obj) => obj.universalIdentifier,
    );

    const objectsToDelete = applicationObjects.filter(
      (obj) =>
        isDefined(obj.universalIdentifier) &&
        !objectsToSyncUniversalIds.includes(obj.universalIdentifier),
    );

    const objectsToUpdate = applicationObjects.filter(
      (obj) =>
        isDefined(obj.universalIdentifier) &&
        objectsToSyncUniversalIds.includes(obj.universalIdentifier),
    );

    const objectsToCreate = objectsToSync.filter(
      (objectToSync) =>
        !applicationObjectsStandardIds.includes(
          objectToSync.universalIdentifier,
        ),
    );

    for (const objectToDelete of objectsToDelete) {
      await this.objectMetadataService.deleteOneObject({
        deleteObjectInput: { id: objectToDelete.id },
        workspaceId,
        isSystemBuild: true,
      });
    }

    for (const objectToUpdate of objectsToUpdate) {
      const objectToSync = objectsToSync.find(
        (obj) => obj.universalIdentifier === objectToUpdate.universalIdentifier,
      );

      if (!objectToSync) {
        throw new ApplicationException(
          `Failed to find object to sync with universalIdentifier ${objectToUpdate.universalIdentifier}`,
          ApplicationExceptionCode.OBJECT_NOT_FOUND,
        );
      }

      const updateObjectInput = {
        id: objectToUpdate.id,
        update: {
          nameSingular: objectToSync.nameSingular,
          namePlural: objectToSync.namePlural,
          labelSingular: objectToSync.labelSingular,
          labelPlural: objectToSync.labelPlural,
          icon: objectToSync.icon || undefined,
          description: objectToSync.description || undefined,
        },
      };

      await this.objectMetadataService.updateOneObject({
        updateObjectInput,
        workspaceId,
      });

      await this.syncFieldsWithoutRelations({
        fieldsToSync: objectToSync.fields,
        objectId: objectToUpdate.id,
        workspaceId,
        applicationId,
      });
    }

    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspaceId,
      );

    for (const objectToCreate of objectsToCreate) {
      const createObjectInput = {
        nameSingular: objectToCreate.nameSingular,
        namePlural: objectToCreate.namePlural,
        labelSingular: objectToCreate.labelSingular,
        labelPlural: objectToCreate.labelPlural,
        icon: objectToCreate.icon || undefined,
        description: objectToCreate.description || undefined,
        standardId: objectToCreate.universalIdentifier,
        dataSourceId: dataSourceMetadata.id,
        universalIdentifier: objectToCreate.universalIdentifier,
        applicationId,
      };

      const createdObject = await this.objectMetadataService.createOneObject({
        createObjectInput,
        applicationId,
        workspaceId,
      });

      await this.syncFieldsWithoutRelations({
        fieldsToSync: objectToCreate.fields,
        objectId: createdObject.id,
        workspaceId,
        applicationId,
      });
    }
  }

  private async syncRelations({
    objectsToSync,
    workspaceId,
    applicationId,
  }: {
    objectsToSync: ObjectManifest[];
    workspaceId: string;
    applicationId: string;
  }) {
    const { flatObjectMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps'],
        },
      );

    for (const objectToSync of objectsToSync) {
      const relationFields = objectToSync.fields.filter(
        (field): field is RelationFieldManifest =>
          this.isRelationFieldManifest(field),
      );

      if (relationFields.length === 0) {
        continue;
      }

      const sourceObjectId =
        flatObjectMetadataMaps.idByUniversalIdentifier[
          objectToSync.universalIdentifier
        ];

      if (!isDefined(sourceObjectId)) {
        throw new ApplicationException(
          `Failed to find source object with universalIdentifier ${objectToSync.universalIdentifier}`,
          ApplicationExceptionCode.OBJECT_NOT_FOUND,
        );
      }

      await this.syncRelationFields({
        objectId: sourceObjectId,
        relationsToSync: relationFields,
        workspaceId,
        applicationId,
        flatObjectMetadataMaps,
      });
    }
  }

  private async syncObjectExtensionsOrThrow({
    objectExtensionsToSync,
    workspaceId,
    applicationId,
  }: {
    objectExtensionsToSync: ObjectExtensionManifest[];
    workspaceId: string;
    applicationId: string;
  }) {
    const { flatObjectMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps'],
        },
      );

    const { idByNameSingular: objectIdByNameSingular } =
      buildObjectIdByNameMaps(flatObjectMetadataMaps);

    for (const objectExtension of objectExtensionsToSync) {
      const { targetObject, fields } = objectExtension;

      let targetObjectId: string | undefined;

      if (isDefined(targetObject.nameSingular)) {
        targetObjectId = objectIdByNameSingular[targetObject.nameSingular];

        if (!isDefined(targetObjectId)) {
          throw new ApplicationException(
            `Failed to find target object with nameSingular "${targetObject.nameSingular}" for object extension`,
            ApplicationExceptionCode.OBJECT_NOT_FOUND,
          );
        }
      } else if (isDefined(targetObject.universalIdentifier)) {
        targetObjectId =
          flatObjectMetadataMaps.idByUniversalIdentifier[
            targetObject.universalIdentifier
          ];

        if (!isDefined(targetObjectId)) {
          throw new ApplicationException(
            `Failed to find target object with universalIdentifier "${targetObject.universalIdentifier}" for object extension`,
            ApplicationExceptionCode.OBJECT_NOT_FOUND,
          );
        }
      }

      if (!isDefined(targetObjectId)) {
        throw new ApplicationException(
          'Object extension must specify either nameSingular or universalIdentifier in targetObject',
          ApplicationExceptionCode.INVALID_INPUT,
        );
      }

      // Sync regular fields for this extension
      await this.syncFieldsWithoutRelations({
        objectId: targetObjectId,
        fieldsToSync: fields,
        workspaceId,
        applicationId,
      });

      // Sync relation fields for this extension
      const relationFields = fields.filter(
        (field): field is RelationFieldManifest =>
          this.isRelationFieldManifest(field),
      );

      if (relationFields.length > 0) {
        await this.syncRelationFields({
          objectId: targetObjectId,
          relationsToSync: relationFields,
          workspaceId,
          applicationId,
          flatObjectMetadataMaps,
        });
      }
    }
  }

  private async syncServerlessFunctions({
    serverlessFunctionsToSync,
    code,
    workspaceId,
    applicationId,
    serverlessFunctionLayerId,
  }: {
    serverlessFunctionsToSync: ServerlessFunctionManifest[];
    workspaceId: string;
    code: Sources;
    applicationId: string;
    serverlessFunctionLayerId: string;
  }) {
    const { flatServerlessFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatServerlessFunctionMaps'],
        },
      );

    const applicationServerlessFunctions = Object.values(
      flatServerlessFunctionMaps.byId,
    ).filter(
      (serverlessFunction) =>
        isDefined(serverlessFunction) &&
        serverlessFunction.applicationId === applicationId,
    ) as FlatServerlessFunction[];

    const serverlessFunctionsToSyncUniversalIdentifiers =
      serverlessFunctionsToSync.map(
        (serverlessFunction) => serverlessFunction.universalIdentifier,
      );

    const applicationServerlessFunctionsUniversalIdentifiers =
      applicationServerlessFunctions.map(
        (serverlessFunction) => serverlessFunction.universalIdentifier,
      );

    const serverlessFunctionsToDelete = applicationServerlessFunctions.filter(
      (serverlessFunction) =>
        isDefined(serverlessFunction.universalIdentifier) &&
        !serverlessFunctionsToSyncUniversalIdentifiers.includes(
          serverlessFunction.universalIdentifier,
        ),
    );

    const serverlessFunctionsToUpdate = applicationServerlessFunctions.filter(
      (serverlessFunction) =>
        isDefined(serverlessFunction.universalIdentifier) &&
        serverlessFunctionsToSyncUniversalIdentifiers.includes(
          serverlessFunction.universalIdentifier,
        ),
    );

    const serverlessFunctionsToCreate = serverlessFunctionsToSync.filter(
      (serverlessFunctionToSync) =>
        !applicationServerlessFunctionsUniversalIdentifiers.includes(
          serverlessFunctionToSync.universalIdentifier,
        ),
    );

    for (const serverlessFunctionToDelete of serverlessFunctionsToDelete) {
      await this.serverlessFunctionV2Service.destroyOne({
        destroyServerlessFunctionInput: { id: serverlessFunctionToDelete.id },
        workspaceId,
        isSystemBuild: true,
      });
    }

    for (const serverlessFunctionToUpdate of serverlessFunctionsToUpdate) {
      const serverlessFunctionToSync = serverlessFunctionsToSync.find(
        (serverlessFunction) =>
          serverlessFunction.universalIdentifier ===
          serverlessFunctionToUpdate.universalIdentifier,
      );

      if (!serverlessFunctionToSync) {
        throw new ApplicationException(
          `Failed to find serverlessFunction to sync with universalIdentifier ${serverlessFunctionToUpdate.universalIdentifier}`,
          ApplicationExceptionCode.SERVERLESS_FUNCTION_NOT_FOUND,
        );
      }

      const name =
        serverlessFunctionToSync.name ??
        parse(serverlessFunctionToSync.handlerName).name;

      const updateServerlessFunctionInput = {
        id: serverlessFunctionToUpdate.id,
        update: {
          name,
          code,
          timeoutSeconds: serverlessFunctionToSync.timeoutSeconds,
          sourceHandlerPath: serverlessFunctionToSync.sourceHandlerPath,
          builtHandlerPath: serverlessFunctionToSync.builtHandlerPath,
          handlerName: serverlessFunctionToSync.handlerName,
          toolInputSchema: serverlessFunctionToSync.toolInputSchema,
          isTool: serverlessFunctionToSync.isTool,
        },
      };

      await this.serverlessFunctionV2Service.updateOne(
        updateServerlessFunctionInput,
        workspaceId,
      );

      // Trigger settings are now embedded in the serverless function entity
      // They are handled through the update input
    }

    for (const serverlessFunctionToCreate of serverlessFunctionsToCreate) {
      const name =
        serverlessFunctionToCreate.name ??
        parse(serverlessFunctionToCreate.handlerName).name;

      const createServerlessFunctionInput = {
        name,
        code,
        universalIdentifier: serverlessFunctionToCreate.universalIdentifier,
        timeoutSeconds: serverlessFunctionToCreate.timeoutSeconds,
        sourceHandlerPath: serverlessFunctionToCreate.sourceHandlerPath,
        handlerName: serverlessFunctionToCreate.handlerName,
        builtHandlerPath: serverlessFunctionToCreate.builtHandlerPath,
        applicationId,
        serverlessFunctionLayerId,
        toolInputSchema: serverlessFunctionToCreate.toolInputSchema,
        isTool: serverlessFunctionToCreate.isTool,
      };

      await this.serverlessFunctionV2Service.createOne({
        createServerlessFunctionInput,
        workspaceId,
        applicationId,
      });

      // Trigger settings are now embedded in the serverless function entity
      // They are handled through the create input
    }
  }

  private extractTriggerSettingsFromManifest(
    triggers: ServerlessFunctionTriggerManifest[] = [],
  ): {
    cronTriggerSettings: CronTriggerSettings | null;
    databaseEventTriggerSettings: DatabaseEventTriggerSettings | null;
    httpRouteTriggerSettings: HttpRouteTriggerSettings | null;
  } {
    let cronTriggerSettings: CronTriggerSettings | null = null;
    let databaseEventTriggerSettings: DatabaseEventTriggerSettings | null =
      null;
    let httpRouteTriggerSettings: HttpRouteTriggerSettings | null = null;

    for (const trigger of triggers) {
      if (trigger.type === 'cron') {
        cronTriggerSettings = { pattern: trigger.pattern };
      } else if (trigger.type === 'databaseEvent') {
        databaseEventTriggerSettings = {
          eventName: trigger.eventName,
          updatedFields: trigger.updatedFields,
        };
      } else if (trigger.type === 'route') {
        httpRouteTriggerSettings = {
          path: trigger.path,
          httpMethod: trigger.httpMethod as HTTPMethod,
          isAuthRequired: trigger.isAuthRequired,
          forwardedRequestHeaders: trigger.forwardedRequestHeaders,
        };
      }
    }

    return {
      cronTriggerSettings,
      databaseEventTriggerSettings,
      httpRouteTriggerSettings,
    };
  }

  public async uninstallApplication({
    workspaceId,
    applicationUniversalIdentifier,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
  }) {
    const {
      flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
      flatIndexMaps: existingFlatIndexMetadataMaps,
      flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
    } = await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatMapsKeys: [
          'flatObjectMetadataMaps',
          'flatIndexMaps',
          'flatFieldMetadataMaps',
        ],
      },
    );

    const application = await this.applicationService.findByUniversalIdentifier(
      { universalIdentifier: applicationUniversalIdentifier, workspaceId },
    );

    if (!isDefined(application)) {
      throw new ApplicationException(
        `Application with universalIdentifier ${applicationUniversalIdentifier} not found`,
        ApplicationExceptionCode.ENTITY_NOT_FOUND,
      );
    }

    if (!application.canBeUninstalled) {
      throw new ApplicationException(
        'This application cannot be uninstalled.',
        ApplicationExceptionCode.FORBIDDEN,
      );
    }

    const flatObjectMetadataMapsByApplicationId =
      findFlatEntitiesByApplicationId({
        flatEntityMaps: existingFlatObjectMetadataMaps,
        applicationId: application.id,
      });

    const flatIndexMetadataMapsByApplicationId =
      findFlatEntitiesByApplicationId({
        flatEntityMaps: existingFlatIndexMetadataMaps,
        applicationId: application.id,
      });

    const flatFieldMetadataMapsByApplicationId =
      findFlatEntitiesByApplicationId({
        flatEntityMaps: existingFlatFieldMetadataMaps,
        applicationId: application.id,
      });

    await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
      {
        allFlatEntityOperationByMetadataName: {
          objectMetadata: {
            flatEntityToCreate: [],
            flatEntityToDelete: flatObjectMetadataMapsByApplicationId,
            flatEntityToUpdate: [],
          },
          index: {
            flatEntityToCreate: [],
            flatEntityToDelete: flatIndexMetadataMapsByApplicationId,
            flatEntityToUpdate: [],
          },
          fieldMetadata: {
            flatEntityToCreate: [],
            flatEntityToDelete: flatFieldMetadataMapsByApplicationId,
            flatEntityToUpdate: [],
          },
        },
        workspaceId,
        isSystemBuild: true,
      },
    );

    await this.applicationService.delete(
      applicationUniversalIdentifier,
      workspaceId,
    );
  }
}
