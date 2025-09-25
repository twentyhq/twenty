import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import {
  AgentManifest,
  AppManifest,
  ObjectManifest,
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

@Injectable()
export class ApplicationSyncService {
  private readonly logger = new Logger(ApplicationSyncService.name);

  constructor(
    private readonly applicationService: ApplicationService,
    private readonly objectMetadataServiceV2: ObjectMetadataServiceV2,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly dataSourceService: DataSourceService,
    private readonly agentService: AgentService,
  ) {}

  public async synchronizeFromManifest(
    workspaceId: string,
    manifest: AppManifest,
  ) {
    const applicationId = await this.syncApplication(manifest, workspaceId);

    await this.syncAgents({
      agentsToSync: manifest.agents,
      workspaceId,
      applicationId,
    });

    await this.syncObjects({
      objectsToSync: manifest.objects,
      workspaceId,
      applicationId,
    });

    this.logger.log('✅ Application sync from manifest completed');
  }

  private async syncApplication(
    applicationToSync: AppManifest,
    workspaceId: string,
  ): Promise<string> {
    const application = await this.applicationService.findByStandardId(
      applicationToSync.standardId,
      workspaceId,
    );

    if (!isDefined(application)) {
      const createdApplication = await this.applicationService.create({
        standardId: applicationToSync.standardId,
        label: applicationToSync.label,
        description: applicationToSync.description,
        version: applicationToSync.version,
        sourcePath: 'cli-sync', // Placeholder for CLI-synced apps
        workspaceId,
      });

      return createdApplication.id;
    }

    await this.applicationService.update(application.id, {
      label: applicationToSync.label,
      description: applicationToSync.description,
      version: applicationToSync.version,
    });

    return application.id;
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
}
