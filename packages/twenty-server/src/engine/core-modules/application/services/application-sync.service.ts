import { Injectable, Logger } from '@nestjs/common';

import { parse } from 'path';

import {
  CronTriggerSettings,
  DatabaseEventTriggerSettings,
  FieldManifest,
  HttpRouteTriggerSettings,
  FrontComponentManifest,
  LogicFunctionManifest,
  Manifest,
  ObjectFieldManifest,
  ObjectManifest,
  RelationFieldManifest,
  RoleManifest,
} from 'twenty-shared/application';
import { FieldMetadataType, FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { PackageJson } from 'type-fest';
import { v4 } from 'uuid';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ApplicationInput } from 'src/engine/core-modules/application/dtos/application.input';
import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { getDefaultApplicationPackageFields } from 'src/engine/core-modules/application-layer/utils/get-default-application-package-fields.util';
import { ApplicationVariableEntityService } from 'src/engine/core-modules/applicationVariable/application-variable.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import type { JsonbProperty } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/jsonb-property.type';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntitiesByApplicationId } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entities-by-application-id.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatFrontComponent } from 'src/engine/metadata-modules/flat-front-component/types/flat-front-component.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { LogicFunctionMetadataService } from 'src/engine/metadata-modules/logic-function/services/logic-function-metadata.service';
import { FrontComponentService } from 'src/engine/metadata-modules/front-component/front-component.service';
import { FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { FieldPermissionService } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.service';
import { ObjectPermissionService } from 'src/engine/metadata-modules/object-permission/object-permission.service';
import { PermissionFlagService } from 'src/engine/metadata-modules/permission-flag/permission-flag.service';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';
import { computeMetadataNameFromLabelOrThrow } from 'src/engine/metadata-modules/utils/compute-metadata-name-from-label-or-throw.util';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

@Injectable()
export class ApplicationSyncService {
  private readonly logger = new Logger(ApplicationSyncService.name);

  constructor(
    private readonly applicationService: ApplicationService,
    private readonly applicationVariableService: ApplicationVariableEntityService,
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly fieldMetadataService: FieldMetadataService,
    private readonly logicFunctionMetadataService: LogicFunctionMetadataService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly dataSourceService: DataSourceService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly roleService: RoleService,
    private readonly objectPermissionService: ObjectPermissionService,
    private readonly fieldPermissionService: FieldPermissionService,
    private readonly permissionService: PermissionFlagService,
    private readonly fileStorageService: FileStorageService,
    private readonly frontComponentService: FrontComponentService,
  ) {}

  public async synchronizeFromManifest({
    workspaceId,
    manifest,
  }: ApplicationInput & {
    workspaceId: string;
  }) {
    const application = await this.syncApplication({
      workspaceId,
      manifest,
    });

    const ownerFlatApplication: FlatApplication = application;

    await this.syncObjects({
      objectsToSync: manifest.objects,
      workspaceId,
      ownerFlatApplication,
    });

    await this.syncObjectRelations({
      objectsToSync: manifest.objects,
      workspaceId,
      ownerFlatApplication,
    });

    if (manifest.fields.length > 0) {
      await this.syncFieldsOrThrow({
        fieldsToSync: manifest.fields,
        workspaceId,
        ownerFlatApplication,
      });
    }

    if (manifest.logicFunctions.length > 0) {
      await this.syncLogicFunctions({
        logicFunctionsToSync: manifest.logicFunctions,
        workspaceId,
        ownerFlatApplication,
      });
    }

    if ((manifest.frontComponents ?? []).length > 0) {
      await this.syncFrontComponents({
        frontComponentsToSync: manifest.frontComponents,
        workspaceId,
        ownerFlatApplication,
      });
    }

    await this.syncRoles({
      manifest,
      workspaceId,
      ownerFlatApplication,
    });

    this.logger.log('✅ Application sync from manifest completed');
  }

  private async syncApplication({
    workspaceId,
    manifest,
  }: ApplicationInput & {
    workspaceId: string;
  }): Promise<ApplicationEntity> {
    const name = manifest.application.displayName;
    const packageJson = JSON.parse(
      (
        await streamToBuffer(
          await this.fileStorageService.readFile({
            applicationUniversalIdentifier:
              manifest.application.universalIdentifier,
            fileFolder: FileFolder.Dependencies,
            resourcePath: 'package.json',
            workspaceId,
          }),
        )
      ).toString('utf-8'),
    ) as PackageJson;

    const defaultPackageFields = await getDefaultApplicationPackageFields();

    let application = await this.applicationService.findByUniversalIdentifier({
      universalIdentifier: manifest.application.universalIdentifier,
      workspaceId,
    });

    if (!application) {
      application = await this.applicationService.create({
        universalIdentifier: manifest.application.universalIdentifier,
        name,
        description: manifest.application.description,
        version: packageJson.version,
        sourcePath: 'cli-sync', // Placeholder for CLI-synced apps
        defaultRoleId: null,
        workspaceId,
        packageJsonChecksum: defaultPackageFields.packageJsonChecksum,
        packageJsonFileId: null,
        yarnLockChecksum: defaultPackageFields.yarnLockChecksum,
        yarnLockFileId: null,
        availablePackages: defaultPackageFields.availablePackages,
      });
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
      packageJsonChecksum: manifest.application.packageJsonChecksum,
      yarnLockChecksum: manifest.application.yarnLockChecksum,
      //availablePackages: manifest.application.availablePackages, // TODO: compute available package in dev-mode-orchestrator
    });
  }

  private async syncRoles({
    manifest,
    workspaceId,
    ownerFlatApplication,
  }: {
    manifest: Manifest;
    workspaceId: string;
    ownerFlatApplication: FlatApplication;
  }) {
    let defaultRoleId: string | null = null;

    for (const role of manifest.roles) {
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
          ownerFlatApplication,
        });
      } else {
        existingRole = await this.roleService.createRole({
          input: role,
          workspaceId,
          ownerFlatApplication,
        });
      }

      await this.syncApplicationRolePermissions({
        role,
        workspaceId,
        roleId: existingRole.id,
      });

      if (
        existingRole.universalIdentifier ===
        manifest.application.defaultRoleUniversalIdentifier
      ) {
        defaultRoleId = existingRole.id;
      }
    }

    if (isDefined(defaultRoleId)) {
      await this.applicationService.update(ownerFlatApplication.id, {
        defaultRoleId: defaultRoleId,
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

      const formattedObjectPermissions = role.objectPermissions
        ?.map((perm) => {
          const flatObjectMetadata = findFlatEntityByUniversalIdentifier({
            flatEntityMaps: flatObjectMetadataMaps,
            universalIdentifier: perm.objectUniversalIdentifier,
          });

          if (!isDefined(flatObjectMetadata)) {
            throw new ApplicationException(
              `Failed to find object with universalIdentifier ${perm.objectUniversalIdentifier}`,
              ApplicationExceptionCode.OBJECT_NOT_FOUND,
            );
          }

          return {
            ...perm,
            objectMetadataId: flatObjectMetadata.id,
          };
        })
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
          const flatObjectMetadata = findFlatEntityByUniversalIdentifier({
            flatEntityMaps: flatObjectMetadataMaps,
            universalIdentifier: perm.objectUniversalIdentifier,
          });

          if (!isDefined(flatObjectMetadata)) {
            throw new ApplicationException(
              `Failed to find object with universalIdentifier ${perm.objectUniversalIdentifier}`,
              ApplicationExceptionCode.OBJECT_NOT_FOUND,
            );
          }

          const flatFieldMetadata = findFlatEntityByUniversalIdentifier({
            flatEntityMaps: flatFieldMetadataMaps,
            universalIdentifier: perm.fieldUniversalIdentifier,
          });

          if (!isDefined(flatFieldMetadata)) {
            throw new ApplicationException(
              `Failed to find field with universalIdentifier ${perm.fieldUniversalIdentifier}`,
              ApplicationExceptionCode.FIELD_NOT_FOUND,
            );
          }

          return {
            ...perm,
            objectMetadataId: flatObjectMetadata.id,
            fieldMetadataId: flatFieldMetadata.id,
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
    field: ObjectFieldManifest,
  ): field is RelationFieldManifest {
    return this.isFieldTypeRelation(field.type);
  }

  private isFieldTypeRelation(type: FieldMetadataType): boolean {
    return type === FieldMetadataType.RELATION;
  }

  private async syncObjectFieldsWithoutRelations({
    objectId,
    fieldsToSync,
    workspaceId,
    ownerFlatApplication,
  }: {
    objectId: string;
    workspaceId: string;
    ownerFlatApplication: FlatApplication;
    fieldsToSync: ObjectFieldManifest[];
  }) {
    const fieldsWithoutRelation = fieldsToSync.filter(
      (field): field is FieldManifest => !this.isRelationFieldManifest(field),
    );

    if (fieldsWithoutRelation.length === 0) {
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
      existingFlatFieldMetadataMaps.byUniversalIdentifier,
    ).filter(
      (field) =>
        isDefined(field) &&
        field.objectMetadataId === objectId &&
        !this.isFieldTypeRelation(field.type),
    ) as FlatFieldMetadata[];

    const fieldsToSyncUniversalIds = fieldsWithoutRelation.map(
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

    const fieldsToCreate = fieldsWithoutRelation.filter(
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
        ownerFlatApplication,
      });
      await this.fieldMetadataService.deleteOneField({
        deleteOneFieldInput: { id: fieldToDelete.id },
        workspaceId,
        ownerFlatApplication,
      });
    }

    for (const fieldToUpdate of fieldsToUpdate) {
      const fieldToSync = fieldsWithoutRelation.find(
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
        ownerFlatApplication,
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
        applicationId: ownerFlatApplication.id,
        isCustom: true,
        workspaceId,
      };

      await this.fieldMetadataService.createOneField({
        createFieldInput,
        workspaceId,
        ownerFlatApplication,
      });
    }
  }

  private async syncObjectFieldsRelationOnly({
    objectId,
    fieldsToSync,
    workspaceId,
    ownerFlatApplication,
    flatObjectMetadataMaps,
  }: {
    objectId: string;
    fieldsToSync: ObjectFieldManifest[];
    workspaceId: string;
    ownerFlatApplication: FlatApplication;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  }) {
    const relationFields = fieldsToSync.filter((field) =>
      this.isRelationFieldManifest(field),
    );

    const { flatFieldMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatFieldMetadataMaps'],
        },
      );

    for (const relation of relationFields) {
      const existingRelationField = Object.values(
        flatFieldMetadataMaps.byUniversalIdentifier,
      ).find(
        (field) =>
          isDefined(field) &&
          field.universalIdentifier === relation.universalIdentifier,
      );

      if (isDefined(existingRelationField)) {
        continue;
      }

      const targetObjectMetadata = findFlatEntityByUniversalIdentifier({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: relation.targetObjectUniversalIdentifier,
      });

      if (!isDefined(targetObjectMetadata)) {
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
        applicationId: ownerFlatApplication.id,
        isCustom: true,
        workspaceId,
        relationCreationPayload: {
          type: relation.relationType,
          targetObjectMetadataId: targetObjectMetadata.id,
          targetFieldLabel: relation.targetFieldLabel,
          targetFieldIcon: relation.targetFieldIcon ?? 'IconRelationOneToMany',
        },
      };

      await this.fieldMetadataService.createOneField({
        createFieldInput,
        workspaceId,
        ownerFlatApplication,
      });
    }
  }

  private async syncObjects({
    objectsToSync,
    workspaceId,
    ownerFlatApplication,
  }: {
    objectsToSync: ObjectManifest[];
    workspaceId: string;
    ownerFlatApplication: FlatApplication;
  }) {
    const { flatObjectMetadataMaps: existingFlatObjectMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps'],
        },
      );

    const applicationObjects = Object.values(
      existingFlatObjectMetadataMaps.byUniversalIdentifier,
    ).filter(
      (obj) => isDefined(obj) && obj.applicationId === ownerFlatApplication.id,
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
        ownerFlatApplication,
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
        ownerFlatApplication,
      });

      await this.syncObjectFieldsWithoutRelations({
        fieldsToSync: objectToSync.fields,
        objectId: objectToUpdate.id,
        workspaceId,
        ownerFlatApplication,
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
        dataSourceId: dataSourceMetadata.id,
        universalIdentifier: objectToCreate.universalIdentifier,
        applicationId: ownerFlatApplication.id,
      };

      const createdObject = await this.objectMetadataService.createOneObject({
        createObjectInput,
        ownerFlatApplication,
        workspaceId,
      });

      await this.syncObjectFieldsWithoutRelations({
        fieldsToSync: objectToCreate.fields,
        objectId: createdObject.id,
        workspaceId,
        ownerFlatApplication,
      });
    }
  }

  private async syncObjectRelations({
    objectsToSync,
    workspaceId,
    ownerFlatApplication,
  }: {
    objectsToSync: ObjectManifest[];
    workspaceId: string;
    ownerFlatApplication: FlatApplication;
  }) {
    const { flatObjectMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps'],
        },
      );

    for (const objectToSync of objectsToSync) {
      const sourceObjectMetadata = findFlatEntityByUniversalIdentifier({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: objectToSync.universalIdentifier,
      });

      if (!isDefined(sourceObjectMetadata)) {
        throw new ApplicationException(
          `Failed to find source object with universalIdentifier ${objectToSync.universalIdentifier}`,
          ApplicationExceptionCode.OBJECT_NOT_FOUND,
        );
      }

      await this.syncObjectFieldsRelationOnly({
        objectId: sourceObjectMetadata.id,
        fieldsToSync: objectToSync.fields,
        workspaceId,
        ownerFlatApplication,
        flatObjectMetadataMaps,
      });
    }
  }

  private async syncFieldsOrThrow({
    fieldsToSync,
    workspaceId,
    ownerFlatApplication,
  }: {
    fieldsToSync: FieldManifest[];
    workspaceId: string;
    ownerFlatApplication: FlatApplication;
  }) {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
        },
      );

    for (const fieldToSync of fieldsToSync) {
      const targetObjectMetadata = findFlatEntityByUniversalIdentifier({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: fieldToSync.objectUniversalIdentifier,
      });

      if (!isDefined(targetObjectMetadata)) {
        throw new ApplicationException(
          'Object extension must specify either nameSingular or universalIdentifier in targetObject',
          ApplicationExceptionCode.INVALID_INPUT,
        );
      }

      if (!this.isFieldTypeRelation(fieldToSync.type)) {
        const existingField = findFlatEntityByUniversalIdentifier({
          flatEntityMaps: flatFieldMetadataMaps,
          universalIdentifier: fieldToSync.universalIdentifier,
        });

        if (isDefined(existingField)) {
          await this.fieldMetadataService.updateOneField({
            updateFieldInput: {
              id: existingField.id,
              label: fieldToSync.label,
              description: fieldToSync.description ?? undefined,
              icon: fieldToSync.icon ?? undefined,
              defaultValue: fieldToSync.defaultValue ?? undefined,
              options: fieldToSync.options ?? undefined,
              settings: fieldToSync.settings ?? undefined,
              isNullable: fieldToSync.isNullable ?? true,
            },
            workspaceId,
            ownerFlatApplication,
          });
        } else {
          const createFieldInput: CreateFieldInput = {
            name: computeMetadataNameFromLabelOrThrow(fieldToSync.label),
            type: fieldToSync.type,
            label: fieldToSync.label,
            description: fieldToSync.description ?? undefined,
            icon: fieldToSync.icon ?? undefined,
            defaultValue: fieldToSync.defaultValue ?? undefined,
            options: fieldToSync.options ?? undefined,
            settings: fieldToSync.settings ?? undefined,
            isNullable: fieldToSync.isNullable ?? true,
            objectMetadataId: targetObjectMetadata.id,
            universalIdentifier: fieldToSync.universalIdentifier,
            applicationId: ownerFlatApplication.id,
            isCustom: true,
            workspaceId,
          };

          await this.fieldMetadataService.createOneField({
            createFieldInput,
            workspaceId,
            ownerFlatApplication,
          });
        }
      }

      await this.syncObjectFieldsRelationOnly({
        objectId: targetObjectMetadata.id,
        fieldsToSync: [fieldToSync],
        workspaceId,
        ownerFlatApplication,
        flatObjectMetadataMaps,
      });
    }
  }

  private async syncLogicFunctions({
    logicFunctionsToSync,
    workspaceId,
    ownerFlatApplication,
  }: {
    logicFunctionsToSync: LogicFunctionManifest[];
    workspaceId: string;
    ownerFlatApplication: FlatApplication;
  }) {
    const { flatLogicFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps'],
        },
      );

    const applicationLogicFunctions = Object.values(
      flatLogicFunctionMaps.byUniversalIdentifier,
    ).filter(
      (logicFunction) =>
        isDefined(logicFunction) &&
        logicFunction.applicationId === ownerFlatApplication.id,
    ) as FlatLogicFunction[];

    const logicFunctionsToSyncUniversalIdentifiers = logicFunctionsToSync.map(
      (logicFunction) => logicFunction.universalIdentifier,
    );

    const applicationLogicFunctionsUniversalIdentifiers =
      applicationLogicFunctions.map(
        (logicFunction) => logicFunction.universalIdentifier,
      );

    const logicFunctionsToDelete = applicationLogicFunctions.filter(
      (logicFunction) =>
        isDefined(logicFunction.universalIdentifier) &&
        !logicFunctionsToSyncUniversalIdentifiers.includes(
          logicFunction.universalIdentifier,
        ),
    );

    const logicFunctionsToUpdate = applicationLogicFunctions.filter(
      (logicFunction) =>
        isDefined(logicFunction.universalIdentifier) &&
        logicFunctionsToSyncUniversalIdentifiers.includes(
          logicFunction.universalIdentifier,
        ),
    );

    const logicFunctionsToCreate = logicFunctionsToSync.filter(
      (logicFunctionToSync) =>
        !applicationLogicFunctionsUniversalIdentifiers.includes(
          logicFunctionToSync.universalIdentifier,
        ),
    );

    for (const logicFunctionToDelete of logicFunctionsToDelete) {
      await this.logicFunctionMetadataService.destroyOne({
        id: logicFunctionToDelete.id,
        workspaceId,
        isSystemBuild: true,
        ownerFlatApplication,
      });
    }

    for (const logicFunctionToUpdate of logicFunctionsToUpdate) {
      const logicFunctionToSync = logicFunctionsToSync.find(
        (logicFunction) =>
          logicFunction.universalIdentifier ===
          logicFunctionToUpdate.universalIdentifier,
      );

      if (!logicFunctionToSync) {
        throw new ApplicationException(
          `Failed to find logicFunction to sync with universalIdentifier ${logicFunctionToUpdate.universalIdentifier}`,
          ApplicationExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
        );
      }

      const name =
        logicFunctionToSync.name ?? parse(logicFunctionToSync.handlerName).name;

      await this.logicFunctionMetadataService.updateOne({
        id: logicFunctionToUpdate.id,
        update: {
          name,
          timeoutSeconds: logicFunctionToSync.timeoutSeconds,
          sourceHandlerPath: logicFunctionToSync.sourceHandlerPath,
          builtHandlerPath: logicFunctionToSync.builtHandlerPath,
          handlerName: logicFunctionToSync.handlerName,
          toolInputSchema: logicFunctionToSync.toolInputSchema,
          isTool: logicFunctionToSync.isTool,
          checksum: logicFunctionToSync.builtHandlerChecksum,
          cronTriggerSettings: logicFunctionToSync.cronTriggerSettings as
            | JsonbProperty<CronTriggerSettings>
            | undefined,
          databaseEventTriggerSettings:
            logicFunctionToSync.databaseEventTriggerSettings as
              | JsonbProperty<DatabaseEventTriggerSettings>
              | undefined,
          httpRouteTriggerSettings:
            logicFunctionToSync.httpRouteTriggerSettings as
              | JsonbProperty<HttpRouteTriggerSettings>
              | undefined,
        },
        workspaceId,
        ownerFlatApplication,
      });
    }

    for (const logicFunctionToCreate of logicFunctionsToCreate) {
      const name =
        logicFunctionToCreate.name ??
        parse(logicFunctionToCreate.handlerName).name;

      await this.logicFunctionMetadataService.createOne({
        input: {
          name,
          universalIdentifier: logicFunctionToCreate.universalIdentifier,
          timeoutSeconds: logicFunctionToCreate.timeoutSeconds,
          sourceHandlerPath: logicFunctionToCreate.sourceHandlerPath,
          handlerName: logicFunctionToCreate.handlerName,
          builtHandlerPath: logicFunctionToCreate.builtHandlerPath,
          toolInputSchema: logicFunctionToCreate.toolInputSchema,
          isTool: logicFunctionToCreate.isTool,
          checksum: logicFunctionToCreate.builtHandlerChecksum,
          id: v4(),
          cronTriggerSettings: logicFunctionToCreate.cronTriggerSettings as
            | JsonbProperty<CronTriggerSettings>
            | undefined,
          databaseEventTriggerSettings:
            logicFunctionToCreate.databaseEventTriggerSettings as
              | JsonbProperty<DatabaseEventTriggerSettings>
              | undefined,
          httpRouteTriggerSettings:
            logicFunctionToCreate.httpRouteTriggerSettings as
              | JsonbProperty<HttpRouteTriggerSettings>
              | undefined,
        },
        workspaceId,
        ownerFlatApplication,
      });
    }
  }

  private async syncFrontComponents({
    frontComponentsToSync,
    workspaceId,
    ownerFlatApplication,
  }: {
    frontComponentsToSync: FrontComponentManifest[];
    workspaceId: string;
    ownerFlatApplication: FlatApplication;
  }) {
    const { flatFrontComponentMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatFrontComponentMaps'],
        },
      );

    const applicationFrontComponents = Object.values(
      flatFrontComponentMaps.byUniversalIdentifier,
    ).filter(
      (frontComponent) =>
        isDefined(frontComponent) &&
        frontComponent.applicationId === ownerFlatApplication.id,
    ) as FlatFrontComponent[];

    const frontComponentsToSyncUniversalIdentifiers = frontComponentsToSync.map(
      (frontComponent) => frontComponent.universalIdentifier,
    );

    const applicationFrontComponentsUniversalIdentifiers =
      applicationFrontComponents.map(
        (frontComponent) => frontComponent.universalIdentifier,
      );

    const frontComponentsToDelete = applicationFrontComponents.filter(
      (frontComponent) =>
        isDefined(frontComponent.universalIdentifier) &&
        !frontComponentsToSyncUniversalIdentifiers.includes(
          frontComponent.universalIdentifier,
        ),
    );

    const frontComponentsToUpdate = applicationFrontComponents.filter(
      (frontComponent) =>
        isDefined(frontComponent.universalIdentifier) &&
        frontComponentsToSyncUniversalIdentifiers.includes(
          frontComponent.universalIdentifier,
        ),
    );

    const frontComponentsToCreate = frontComponentsToSync.filter(
      (frontComponentToSync) =>
        !applicationFrontComponentsUniversalIdentifiers.includes(
          frontComponentToSync.universalIdentifier,
        ),
    );

    for (const frontComponentToDelete of frontComponentsToDelete) {
      await this.frontComponentService.destroyOne({
        id: frontComponentToDelete.id,
        workspaceId,
        isSystemBuild: true,
        ownerFlatApplication,
      });
    }

    for (const frontComponentToUpdate of frontComponentsToUpdate) {
      const frontComponentToSync = frontComponentsToSync.find(
        (frontComponent) =>
          frontComponent.universalIdentifier ===
          frontComponentToUpdate.universalIdentifier,
      );

      if (!frontComponentToSync) {
        throw new ApplicationException(
          `Failed to find frontComponent to sync with universalIdentifier ${frontComponentToUpdate.universalIdentifier}`,
          ApplicationExceptionCode.FRONT_COMPONENT_NOT_FOUND,
        );
      }

      await this.frontComponentService.updateOne({
        id: frontComponentToUpdate.id,
        update: frontComponentToSync,
        workspaceId,
        ownerFlatApplication,
      });
    }

    for (const frontComponentToCreate of frontComponentsToCreate) {
      await this.frontComponentService.createOne({
        input: frontComponentToCreate,
        workspaceId,
        ownerFlatApplication,
      });
    }
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
      flatFrontComponentMaps: existingFlatFrontComponentMaps,
      flatLogicFunctionMaps: existingFlatLogicFunctionMaps,
      flatRoleMaps: existingFlatRoleMaps,
    } = await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatMapsKeys: [
          'flatObjectMetadataMaps',
          'flatIndexMaps',
          'flatFieldMetadataMaps',
          'flatFrontComponentMaps',
          'flatLogicFunctionMaps',
          'flatRoleMaps',
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

    const flatFrontComponentMapsByApplicationId =
      findFlatEntitiesByApplicationId({
        flatEntityMaps: existingFlatFrontComponentMaps,
        applicationId: application.id,
      });

    const flatLogicFunctionMapsByApplicationId =
      findFlatEntitiesByApplicationId({
        flatEntityMaps: existingFlatLogicFunctionMaps,
        applicationId: application.id,
      });

    const flatRoleMapsByApplicationId = findFlatEntitiesByApplicationId({
      flatEntityMaps: existingFlatRoleMaps,
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
          frontComponent: {
            flatEntityToCreate: [],
            flatEntityToDelete: flatFrontComponentMapsByApplicationId,
            flatEntityToUpdate: [],
          },
          logicFunction: {
            flatEntityToCreate: [],
            flatEntityToDelete: flatLogicFunctionMapsByApplicationId,
            flatEntityToUpdate: [],
          },
          role: {
            flatEntityToCreate: [],
            flatEntityToDelete: flatRoleMapsByApplicationId,
            flatEntityToUpdate: [],
          },
        },
        workspaceId,
        isSystemBuild: true,
        applicationUniversalIdentifier,
      },
    );

    await this.applicationService.delete(
      applicationUniversalIdentifier,
      workspaceId,
    );
  }
}
