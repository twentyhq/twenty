import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import {
  AgentManifest,
  ObjectManifest,
  ServerlessFunctionManifest,
} from 'src/engine/core-modules/application/types/application.types';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/core-modules/common/services/workspace-many-or-all-flat-entity-maps-cache.service.';
import type { FlatObjectMetadataWithFlatFieldMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-with-flat-field-metadata-maps.type';
import { ObjectMetadataServiceV2 } from 'src/engine/metadata-modules/object-metadata/object-metadata-v2.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { AgentService } from 'src/engine/metadata-modules/agent/agent.service';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ApplicationInput } from 'src/engine/core-modules/application/dtos/application.input';
import { ServerlessFunctionLayerService } from 'src/engine/metadata-modules/serverless-function-layer/serverless-function-layer.service';
import { FlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/types/flat-serverless-function.type';
import { ServerlessFunctionV2Service } from 'src/engine/metadata-modules/serverless-function/services/serverless-function-v2.service';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';

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
      manifest.standardId,
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
        universalIdentifier: manifest.standardId,
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
    const {
      flatServerlessFunctionMaps,
      flatCronTriggerMaps,
      flatDatabaseEventTriggerMaps,
    } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatEntities: [
            'flatServerlessFunctionMaps',
            'flatCronTriggerMaps',
            'flatDatabaseEventTriggerMaps',
          ],
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
      await this.serverlessFunctionV2Service.deleteOne({
        deleteServerlessFunctionInput: { id: serverlessFunctionToDelete.id },
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
        code: serverlessFunctionToSync.code,
      };

      await this.serverlessFunctionV2Service.updateOne(
        updateServerlessFunctionInput,
        workspaceId,
      );
    }

    for (const serverlessFunctionToCreate of serverlessFunctionsToCreate) {
      //await
    }
  }
}
