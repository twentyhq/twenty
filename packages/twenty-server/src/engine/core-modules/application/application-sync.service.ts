import { Injectable, Logger } from '@nestjs/common';

import { parse } from 'path';

import { ALL_METADATA_NAME, AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { ApplicationInput } from 'src/engine/core-modules/application/dtos/application.input';
import {
  FieldManifest,
  ObjectManifest,
  ServerlessFunctionManifest,
  ServerlessFunctionTriggerManifest,
} from 'src/engine/core-modules/application/types/application.types';
import { ApplicationVariableEntityService } from 'src/engine/core-modules/applicationVariable/application-variable.service';
import { CronTriggerV2Service } from 'src/engine/metadata-modules/cron-trigger/services/cron-trigger-v2.service';
import { FlatCronTrigger } from 'src/engine/metadata-modules/cron-trigger/types/flat-cron-trigger.type';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { DatabaseEventTriggerV2Service } from 'src/engine/metadata-modules/database-event-trigger/services/database-event-trigger-v2.service';
import { FlatDatabaseEventTrigger } from 'src/engine/metadata-modules/database-event-trigger/types/flat-database-event-trigger.type';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { getFlatEntitiesByApplicationId } from 'src/engine/metadata-modules/flat-entity/utils/get-flat-entities-by-application-id.util';
import { getSubFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/get-sub-flat-entity-maps-or-throw.util';
import { ObjectMetadataServiceV2 } from 'src/engine/metadata-modules/object-metadata/object-metadata-v2.service';
import { RouteTriggerV2Service } from 'src/engine/metadata-modules/route-trigger/services/route-trigger-v2.service';
import { FlatRouteTrigger } from 'src/engine/metadata-modules/route-trigger/types/flat-route-trigger.type';
import { ServerlessFunctionLayerService } from 'src/engine/metadata-modules/serverless-function-layer/serverless-function-layer.service';
import { ServerlessFunctionV2Service } from 'src/engine/metadata-modules/serverless-function/services/serverless-function-v2.service';
import { FlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/types/flat-serverless-function.type';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-validate-build-and-run-service';
import { Sources } from 'src/engine/core-modules/file-storage/types/source.type';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FieldMetadataServiceV2 } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service-v2';
import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { computeMetadataNameFromLabel } from 'src/engine/metadata-modules/utils/validate-name-and-label-are-sync-or-throw.util';

@Injectable()
export class ApplicationSyncService {
  private readonly logger = new Logger(ApplicationSyncService.name);

  constructor(
    private readonly applicationService: ApplicationService,
    private readonly applicationVariableService: ApplicationVariableEntityService,
    private readonly serverlessFunctionLayerService: ServerlessFunctionLayerService,
    private readonly objectMetadataServiceV2: ObjectMetadataServiceV2,
    private readonly fieldMetadataServiceV2: FieldMetadataServiceV2,
    private readonly serverlessFunctionV2Service: ServerlessFunctionV2Service,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly dataSourceService: DataSourceService,
    private readonly databaseEventTriggerV2Service: DatabaseEventTriggerV2Service,
    private readonly cronTriggerV2Service: CronTriggerV2Service,
    private readonly routeTriggerV2Service: RouteTriggerV2Service,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
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

    await this.syncServerlessFunctions({
      serverlessFunctionsToSync: manifest.serverlessFunctions,
      code: manifest.sources,
      workspaceId,
      applicationId: application.id,
      serverlessFunctionLayerId: application.serverlessFunctionLayerId,
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
    const application = await this.applicationService.findByUniversalIdentifier(
      manifest.application.universalIdentifier,
      workspaceId,
    );

    const name = manifest.application.displayName ?? packageJson.name;

    if (!isDefined(application)) {
      const serverlessFunctionLayer =
        await this.serverlessFunctionLayerService.create(
          {
            packageJson,
            yarnLock,
          },
          workspaceId,
        );

      const application = await this.applicationService.create({
        universalIdentifier: manifest.application.universalIdentifier,
        name,
        description: manifest.application.description,
        version: packageJson.version,
        sourcePath: 'cli-sync', // Placeholder for CLI-synced apps
        serverlessFunctionLayerId: serverlessFunctionLayer.id,
        workspaceId,
      });

      await this.applicationVariableService.upsertManyApplicationVariableEntities(
        {
          applicationVariables: manifest.application.applicationVariables,
          applicationId: application.id,
        },
      );

      return application;
    }

    await this.serverlessFunctionLayerService.update(
      application.serverlessFunctionLayerId,
      {
        packageJson,
        yarnLock,
      },
    );

    await this.applicationService.update(application.id, {
      name,
      description: manifest.application.description,
      version: packageJson.version,
    });

    await this.applicationVariableService.upsertManyApplicationVariableEntities(
      {
        applicationVariables: manifest.application.applicationVariables,
        applicationId: application.id,
      },
    );

    return application;
  }

  private async syncFields({
    objectId,
    fieldsToSync,
    workspaceId,
    applicationId,
  }: {
    objectId: string;
    workspaceId: string;
    applicationId: string;
    fieldsToSync?: FieldManifest[];
  }) {
    if (!isDefined(fieldsToSync)) {
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
      (field) => isDefined(field) && field.objectMetadataId === objectId,
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
        field.isCustom === true,
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
      await this.fieldMetadataServiceV2.updateOne({
        updateFieldInput: {
          id: fieldToDelete.id,
          isActive: false,
        },
        workspaceId,
      });
      await this.fieldMetadataServiceV2.deleteOneField({
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

      await this.fieldMetadataServiceV2.updateOne({
        updateFieldInput,
        workspaceId,
      });
    }

    for (const fieldToCreate of fieldsToCreate) {
      const createFieldInput: CreateFieldInput = {
        name: computeMetadataNameFromLabel(fieldToCreate.label),
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

      await this.fieldMetadataServiceV2.createOne({
        createFieldInput,
        workspaceId,
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
      await this.objectMetadataServiceV2.deleteOne({
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

      await this.objectMetadataServiceV2.updateOne({
        updateObjectInput,
        workspaceId,
      });

      await this.syncFields({
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
        universalIdentifier: objectToCreate.universalIdentifier,
        dataSourceId: dataSourceMetadata.id,
        applicationId,
      };

      const createdObject = await this.objectMetadataServiceV2.createOne({
        createObjectInput,
        workspaceId,
      });

      await this.syncFields({
        fieldsToSync: objectToCreate.fields,
        objectId: createdObject.id,
        workspaceId,
        applicationId,
      });
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
          handlerPath: serverlessFunctionToSync.handlerPath,
          handlerName: serverlessFunctionToSync.handlerName,
        },
      };

      await this.serverlessFunctionV2Service.updateOne(
        updateServerlessFunctionInput,
        workspaceId,
      );

      await this.syncDatabaseEventTriggersForServerlessFunction({
        serverlessFunctionId: serverlessFunctionToUpdate.id,
        triggersToSync: serverlessFunctionToSync.triggers || [],
        workspaceId,
      });

      await this.syncCronTriggersForServerlessFunction({
        serverlessFunctionId: serverlessFunctionToUpdate.id,
        triggersToSync: serverlessFunctionToSync.triggers || [],
        workspaceId,
      });

      await this.syncRouteTriggersForServerlessFunction({
        serverlessFunctionId: serverlessFunctionToUpdate.id,
        triggersToSync: serverlessFunctionToSync.triggers || [],
        workspaceId,
      });
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
        handlerPath: serverlessFunctionToCreate.handlerPath,
        handlerName: serverlessFunctionToCreate.handlerName,
        applicationId,
        serverlessFunctionLayerId,
      };

      const createdServerlessFunction =
        await this.serverlessFunctionV2Service.createOne({
          createServerlessFunctionInput,
          workspaceId,
        });

      await this.syncDatabaseEventTriggersForServerlessFunction({
        serverlessFunctionId: createdServerlessFunction.id,
        triggersToSync: serverlessFunctionToCreate.triggers || [],
        workspaceId,
      });

      await this.syncCronTriggersForServerlessFunction({
        serverlessFunctionId: createdServerlessFunction.id,
        triggersToSync: serverlessFunctionToCreate.triggers || [],
        workspaceId,
      });

      await this.syncRouteTriggersForServerlessFunction({
        serverlessFunctionId: createdServerlessFunction.id,
        triggersToSync: serverlessFunctionToCreate.triggers || [],
        workspaceId,
      });
    }
  }

  private async syncDatabaseEventTriggersForServerlessFunction({
    serverlessFunctionId,
    triggersToSync,
    workspaceId,
  }: {
    serverlessFunctionId: string;
    triggersToSync: ServerlessFunctionTriggerManifest[];
    workspaceId: string;
  }) {
    const databaseEventTriggersToSync = triggersToSync.filter(
      (trigger) => trigger.type === 'databaseEvent',
    );

    const { flatDatabaseEventTriggerMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatDatabaseEventTriggerMaps'],
        },
      );

    const existingDatabaseEventTriggers = Object.values(
      flatDatabaseEventTriggerMaps.byId,
    ).filter(
      (trigger) =>
        isDefined(trigger) &&
        trigger.serverlessFunctionId === serverlessFunctionId,
    ) as FlatDatabaseEventTrigger[];

    const triggersToSyncUniversalIdentifiers = databaseEventTriggersToSync.map(
      (trigger) => trigger.universalIdentifier,
    );

    const existingTriggersUniversalIdentifiers =
      existingDatabaseEventTriggers.map(
        (trigger) => trigger.universalIdentifier,
      );

    const triggersToDelete = existingDatabaseEventTriggers.filter(
      (trigger) =>
        isDefined(trigger.universalIdentifier) &&
        !triggersToSyncUniversalIdentifiers.includes(
          trigger.universalIdentifier,
        ),
    );

    const triggersToUpdate = existingDatabaseEventTriggers.filter(
      (trigger) =>
        isDefined(trigger.universalIdentifier) &&
        triggersToSyncUniversalIdentifiers.includes(
          trigger.universalIdentifier,
        ),
    );

    const triggersToCreate = databaseEventTriggersToSync.filter(
      (triggerToSync) =>
        !existingTriggersUniversalIdentifiers.includes(
          triggerToSync.universalIdentifier,
        ),
    );

    for (const triggerToDelete of triggersToDelete) {
      await this.databaseEventTriggerV2Service.destroyOne({
        destroyDatabaseEventTriggerInput: { id: triggerToDelete.id },
        workspaceId,
      });
    }

    for (const triggerToUpdate of triggersToUpdate) {
      const triggerToSync = databaseEventTriggersToSync.find(
        (trigger) =>
          trigger.universalIdentifier === triggerToUpdate.universalIdentifier,
      );

      if (!triggerToSync || triggerToSync.type !== 'databaseEvent') {
        throw new ApplicationException(
          `Failed to find database event trigger to sync with universalIdentifier ${triggerToUpdate.universalIdentifier}`,
          ApplicationExceptionCode.ENTITY_NOT_FOUND,
        );
      }

      const updateDatabaseEventTriggerInput = {
        id: triggerToUpdate.id,
        update: {
          settings: {
            eventName: triggerToSync.eventName,
          },
        },
      };

      await this.databaseEventTriggerV2Service.updateOne(
        updateDatabaseEventTriggerInput,
        workspaceId,
      );
    }

    for (const triggerToCreate of triggersToCreate) {
      if (triggerToCreate.type !== 'databaseEvent') {
        continue;
      }

      const createDatabaseEventTriggerInput = {
        settings: {
          eventName: triggerToCreate.eventName,
        },
        universalIdentifier: triggerToCreate.universalIdentifier,
        serverlessFunctionId,
      };

      await this.databaseEventTriggerV2Service.createOne(
        createDatabaseEventTriggerInput,
        workspaceId,
      );
    }
  }

  private async syncCronTriggersForServerlessFunction({
    serverlessFunctionId,
    triggersToSync,
    workspaceId,
  }: {
    serverlessFunctionId: string;
    triggersToSync: ServerlessFunctionTriggerManifest[];
    workspaceId: string;
  }) {
    const cronTriggersToSync = triggersToSync.filter(
      (trigger) => trigger.type === 'cron',
    );

    const { flatCronTriggerMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatCronTriggerMaps'],
        },
      );

    const existingCronTriggers = Object.values(flatCronTriggerMaps.byId).filter(
      (trigger) =>
        isDefined(trigger) &&
        trigger.serverlessFunctionId === serverlessFunctionId,
    ) as FlatCronTrigger[];

    const triggersToSyncUniversalIdentifiers = cronTriggersToSync.map(
      (trigger) => trigger.universalIdentifier,
    );

    const existingTriggersUniversalIdentifiers = existingCronTriggers.map(
      (trigger) => trigger.universalIdentifier,
    );

    const triggersToDelete = existingCronTriggers.filter(
      (trigger) =>
        isDefined(trigger.universalIdentifier) &&
        !triggersToSyncUniversalIdentifiers.includes(
          trigger.universalIdentifier,
        ),
    );

    const triggersToUpdate = existingCronTriggers.filter(
      (trigger) =>
        isDefined(trigger.universalIdentifier) &&
        triggersToSyncUniversalIdentifiers.includes(
          trigger.universalIdentifier,
        ),
    );

    const triggersToCreate = cronTriggersToSync.filter(
      (triggerToSync) =>
        !existingTriggersUniversalIdentifiers.includes(
          triggerToSync.universalIdentifier,
        ),
    );

    for (const triggerToDelete of triggersToDelete) {
      await this.cronTriggerV2Service.destroyOne({
        destroyCronTriggerInput: { id: triggerToDelete.id },
        workspaceId,
      });
    }

    for (const triggerToUpdate of triggersToUpdate) {
      const triggerToSync = cronTriggersToSync.find(
        (trigger) =>
          trigger.universalIdentifier === triggerToUpdate.universalIdentifier,
      );

      if (!triggerToSync || triggerToSync.type !== 'cron') {
        throw new ApplicationException(
          `Failed to find cron trigger to sync with universalIdentifier ${triggerToUpdate.universalIdentifier}`,
          ApplicationExceptionCode.ENTITY_NOT_FOUND,
        );
      }

      const updateCronTriggerInput = {
        id: triggerToUpdate.id,
        update: {
          settings: {
            pattern: triggerToSync.pattern,
          },
        },
      };

      await this.cronTriggerV2Service.updateOne(
        updateCronTriggerInput,
        workspaceId,
      );
    }

    for (const triggerToCreate of triggersToCreate) {
      if (triggerToCreate.type !== 'cron') {
        continue;
      }

      const createCronTriggerInput = {
        settings: {
          pattern: triggerToCreate.pattern,
        },
        universalIdentifier: triggerToCreate.universalIdentifier,
        serverlessFunctionId,
      };

      await this.cronTriggerV2Service.createOne(
        createCronTriggerInput,
        workspaceId,
      );
    }
  }

  private async syncRouteTriggersForServerlessFunction({
    serverlessFunctionId,
    triggersToSync,
    workspaceId,
  }: {
    serverlessFunctionId: string;
    triggersToSync: ServerlessFunctionTriggerManifest[];
    workspaceId: string;
  }) {
    const routeTriggersToSync = triggersToSync.filter(
      (trigger) => trigger.type === 'route',
    );

    const { flatRouteTriggerMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatRouteTriggerMaps'],
        },
      );

    const existingRouteTriggers = Object.values(
      flatRouteTriggerMaps.byId,
    ).filter(
      (trigger) =>
        isDefined(trigger) &&
        trigger.serverlessFunctionId === serverlessFunctionId,
    ) as FlatRouteTrigger[];

    const triggersToSyncUniversalIdentifiers = routeTriggersToSync.map(
      (trigger) => trigger.universalIdentifier,
    );

    const existingTriggersUniversalIdentifiers = existingRouteTriggers.map(
      (trigger) => trigger.universalIdentifier,
    );

    const triggersToDelete = existingRouteTriggers.filter(
      (trigger) =>
        isDefined(trigger.universalIdentifier) &&
        !triggersToSyncUniversalIdentifiers.includes(
          trigger.universalIdentifier,
        ),
    );

    const triggersToUpdate = existingRouteTriggers.filter(
      (trigger) =>
        isDefined(trigger.universalIdentifier) &&
        triggersToSyncUniversalIdentifiers.includes(
          trigger.universalIdentifier,
        ),
    );

    const triggersToCreate = routeTriggersToSync.filter(
      (triggerToSync) =>
        !existingTriggersUniversalIdentifiers.includes(
          triggerToSync.universalIdentifier,
        ),
    );

    for (const triggerToDelete of triggersToDelete) {
      await this.routeTriggerV2Service.destroyOne({
        destroyRouteTriggerInput: { id: triggerToDelete.id },
        workspaceId,
      });
    }

    for (const triggerToUpdate of triggersToUpdate) {
      const triggerToSync = routeTriggersToSync.find(
        (trigger) =>
          trigger.universalIdentifier === triggerToUpdate.universalIdentifier,
      );

      if (!triggerToSync || triggerToSync.type !== 'route') {
        throw new ApplicationException(
          `Failed to find route trigger to sync with universalIdentifier ${triggerToUpdate.universalIdentifier}`,
          ApplicationExceptionCode.ENTITY_NOT_FOUND,
        );
      }

      const updateRouteTriggerInput = {
        id: triggerToUpdate.id,
        update: {
          path: triggerToSync.path,
          httpMethod: triggerToSync.httpMethod,
          isAuthRequired: triggerToSync.isAuthRequired,
        },
      };

      await this.routeTriggerV2Service.updateOne(
        updateRouteTriggerInput,
        workspaceId,
      );
    }

    for (const triggerToCreate of triggersToCreate) {
      if (triggerToCreate.type !== 'route') {
        continue;
      }

      const createRouteTriggerInput = {
        path: triggerToCreate.path,
        httpMethod: triggerToCreate.httpMethod,
        isAuthRequired: triggerToCreate.isAuthRequired,
        serverlessFunctionId,
      };

      await this.routeTriggerV2Service.createOne(
        createRouteTriggerInput,
        workspaceId,
      );
    }
  }

  public async deleteApplication({
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
      applicationUniversalIdentifier,
      workspaceId,
    );

    if (!isDefined(application)) {
      throw new ApplicationException(
        `Application with universalIdentifier ${applicationUniversalIdentifier} not found`,
        ApplicationExceptionCode.ENTITY_NOT_FOUND,
      );
    }

    const flatObjectMetadataMapsByApplicationId =
      getFlatEntitiesByApplicationId(
        existingFlatObjectMetadataMaps,
        application.id,
      );

    const fromFlatObjectMetadataMaps = getSubFlatEntityMapsOrThrow({
      flatEntityIds: flatObjectMetadataMapsByApplicationId.map((obj) => obj.id),
      flatEntityMaps: existingFlatObjectMetadataMaps,
    });

    const flatIndexMetadataMapsByApplicationId = getFlatEntitiesByApplicationId(
      existingFlatIndexMetadataMaps,
      application.id,
    );

    const fromFlatIndexMetadataMaps = getSubFlatEntityMapsOrThrow({
      flatEntityIds: flatIndexMetadataMapsByApplicationId.map(
        (field) => field.id,
      ),
      flatEntityMaps: existingFlatIndexMetadataMaps,
    });

    const flatFieldMetadataMapsByApplicationId = getFlatEntitiesByApplicationId(
      existingFlatFieldMetadataMaps,
      application.id,
    );

    const fromFlatFieldMetadataMaps = getSubFlatEntityMapsOrThrow({
      flatEntityIds: flatFieldMetadataMapsByApplicationId.map((idx) => idx.id),
      flatEntityMaps: existingFlatFieldMetadataMaps,
    });

    await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
      {
        fromToAllFlatEntityMaps: {
          flatObjectMetadataMaps: {
            from: fromFlatObjectMetadataMaps,
            to: createEmptyFlatEntityMaps(),
          },
          flatIndexMaps: {
            from: fromFlatIndexMetadataMaps,
            to: createEmptyFlatEntityMaps(),
          },
          flatFieldMetadataMaps: {
            from: fromFlatFieldMetadataMaps,
            to: createEmptyFlatEntityMaps(),
          },
        },
        workspaceId,
        buildOptions: {
          isSystemBuild: true,
          inferDeletionFromMissingEntities: {
            ...Object.values(ALL_METADATA_NAME).reduce(
              (acc, metadataName) => ({
                ...acc,
                [metadataName]: true,
              }),
              {} as Partial<Record<AllMetadataName, boolean>>,
            ),
          },
        },
      },
    );

    await this.applicationService.delete(
      applicationUniversalIdentifier,
      workspaceId,
    );
  }
}
