import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { ApplicationInput } from 'src/engine/core-modules/application/dtos/application.input';
import {
  AgentManifest,
  ObjectManifest,
  ServerlessFunctionManifest,
  ServerlessFunctionTriggerManifest,
} from 'src/engine/core-modules/application/types/application.types';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/core-modules/common/services/workspace-many-or-all-flat-entity-maps-cache.service.';
import { AgentService } from 'src/engine/metadata-modules/agent/agent.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { DatabaseEventTriggerV2Service } from 'src/engine/metadata-modules/database-event-trigger/services/database-event-trigger-v2.service';
import { FlatDatabaseEventTrigger } from 'src/engine/metadata-modules/database-event-trigger/types/flat-database-event-trigger.type';
import { CronTriggerV2Service } from 'src/engine/metadata-modules/cron-trigger/services/cron-trigger-v2.service';
import { FlatCronTrigger } from 'src/engine/metadata-modules/cron-trigger/types/flat-cron-trigger.type';
import type { FlatObjectMetadataWithFlatFieldMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-with-flat-field-metadata-maps.type';
import { ObjectMetadataServiceV2 } from 'src/engine/metadata-modules/object-metadata/object-metadata-v2.service';
import { ServerlessFunctionLayerService } from 'src/engine/metadata-modules/serverless-function-layer/serverless-function-layer.service';
import { ServerlessFunctionV2Service } from 'src/engine/metadata-modules/serverless-function/services/serverless-function-v2.service';
import { FlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/types/flat-serverless-function.type';

@Injectable()
export class ApplicationSyncService {
  private readonly logger = new Logger(ApplicationSyncService.name);

  constructor(
    private readonly applicationService: ApplicationService,
    private readonly serverlessFunctionLayerService: ServerlessFunctionLayerService,
    private readonly objectMetadataServiceV2: ObjectMetadataServiceV2,
    private readonly serverlessFunctionV2Service: ServerlessFunctionV2Service,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly dataSourceService: DataSourceService,
    private readonly agentService: AgentService,
    private readonly databaseEventTriggerV2Service: DatabaseEventTriggerV2Service,
    private readonly cronTriggerV2Service: CronTriggerV2Service,
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

    await this.syncAgents({
      agentsToSync: manifest.agents,
      workspaceId,
      applicationId: application.id,
    });

    await this.syncObjects({
      objectsToSync: manifest.objects,
      workspaceId,
      applicationId: application.id,
    });

    await this.syncServerlessFunctions({
      serverlessFunctionsToSync: manifest.serverlessFunctions,
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
      manifest.universalIdentifier,
      workspaceId,
    );

    if (!isDefined(application)) {
      const serverlessFunctionLayer =
        await this.serverlessFunctionLayerService.create(
          {
            packageJson,
            yarnLock,
          },
          workspaceId,
        );

      return await this.applicationService.create({
        universalIdentifier: manifest.universalIdentifier,
        label: manifest.label,
        description: manifest.description,
        version: manifest.version,
        sourcePath: 'cli-sync', // Placeholder for CLI-synced apps
        serverlessFunctionLayerId: serverlessFunctionLayer.id,
        workspaceId,
      });
    }

    await this.serverlessFunctionLayerService.update(
      application.serverlessFunctionLayerId,
      {
        packageJson,
        yarnLock,
      },
    );

    await this.applicationService.update(application.id, {
      label: manifest.label,
      description: manifest.description,
      version: manifest.version,
    });

    return application;
  }

  private async syncAgents({
    agentsToSync,
    workspaceId,
    applicationId,
  }: {
    agentsToSync: AgentManifest[];
    workspaceId: string;
    applicationId: string;
  }) {
    for (const agentToSync of agentsToSync) {
      const existingAgent =
        await this.agentService.findOneByApplicationAndStandardId({
          workspaceId,
          applicationId,
          standardId: agentToSync.standardId,
        });

      if (isDefined(existingAgent)) {
        await this.agentService.updateOneAgent(
          { id: existingAgent.id, ...agentToSync },
          workspaceId,
        );

        return;
      }

      await this.agentService.createOneAgent(
        {
          name: agentToSync.name,
          label: agentToSync.label,
          description: agentToSync.description,
          icon: agentToSync.icon,
          prompt: agentToSync.prompt,
          modelId: agentToSync.modelId,
          standardId: agentToSync.standardId,
          isCustom: true,
          applicationId,
        },
        workspaceId,
      );
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
          flatEntities: ['flatObjectMetadataMaps'],
        },
      );

    const applicationObjects = Object.values(
      existingFlatObjectMetadataMaps.byId,
    ).filter(
      (obj) => isDefined(obj) && obj.applicationId === applicationId,
    ) as FlatObjectMetadataWithFlatFieldMaps[];

    const objectsToSyncStandardIds = objectsToSync.map((obj) => obj.standardId);

    const applicationObjectsStandardIds = applicationObjects.map(
      (obj) => obj.standardId,
    );

    const objectsToDelete = applicationObjects.filter(
      (obj) =>
        isDefined(obj.standardId) &&
        !objectsToSyncStandardIds.includes(obj.standardId),
    );

    const objectsToUpdate = applicationObjects.filter(
      (obj) =>
        isDefined(obj.standardId) &&
        objectsToSyncStandardIds.includes(obj.standardId),
    );

    const objectsToCreate = objectsToSync.filter(
      (objectToSync) =>
        !applicationObjectsStandardIds.includes(objectToSync.standardId),
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
        (obj) => obj.standardId === objectToUpdate.standardId,
      );

      if (!objectToSync) {
        throw new ApplicationException(
          `Failed to find object to sync with standardId ${objectToUpdate.standardId}`,
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
        standardId: objectToCreate.standardId || undefined,
        dataSourceId: dataSourceMetadata.id,
        applicationId,
      };

      await this.objectMetadataServiceV2.createOne({
        createObjectInput,
        workspaceId,
      });
    }
  }

  private async syncServerlessFunctions({
    serverlessFunctionsToSync,
    workspaceId,
    applicationId,
    serverlessFunctionLayerId,
  }: {
    serverlessFunctionsToSync: ServerlessFunctionManifest[];
    workspaceId: string;
    applicationId: string;
    serverlessFunctionLayerId: string;
  }) {
    const { flatServerlessFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatEntities: ['flatServerlessFunctionMaps'],
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

      const updateServerlessFunctionInput = {
        id: serverlessFunctionToUpdate.id,
        name: serverlessFunctionToSync.name,
        timeoutSeconds: serverlessFunctionToSync.timeoutSeconds,
        code: serverlessFunctionToSync.code,
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
    }

    for (const serverlessFunctionToCreate of serverlessFunctionsToCreate) {
      const createServerlessFunctionInput = {
        name: serverlessFunctionToCreate.name,
        code: serverlessFunctionToCreate.code,
        universalIdentifier: serverlessFunctionToCreate.universalIdentifier,
        timeoutSeconds: serverlessFunctionToCreate.timeoutSeconds,
        applicationId,
        serverlessFunctionLayerId,
      };

      const createdServerlessFunction =
        await this.serverlessFunctionV2Service.createOne(
          createServerlessFunctionInput,
          workspaceId,
        );

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
          flatEntities: ['flatDatabaseEventTriggerMaps'],
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
          ApplicationExceptionCode.SERVERLESS_FUNCTION_NOT_FOUND,
        );
      }

      const updateDatabaseEventTriggerInput = {
        id: triggerToUpdate.id,
        settings: {
          eventName: triggerToSync.eventName,
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
          flatEntities: ['flatCronTriggerMaps'],
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
          ApplicationExceptionCode.SERVERLESS_FUNCTION_NOT_FOUND,
        );
      }

      const updateCronTriggerInput = {
        id: triggerToUpdate.id,
        settings: {
          pattern: triggerToSync.schedule,
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
          pattern: triggerToCreate.schedule,
        },
        serverlessFunctionId,
      };

      await this.cronTriggerV2Service.createOne(
        createCronTriggerInput,
        workspaceId,
      );
    }
  }
}
