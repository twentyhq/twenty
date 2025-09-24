import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { LocalApplicationSourceProvider } from 'src/engine/core-modules/application/providers/local-application-source.provider';
import { ApplicationSyncAgentService } from 'src/engine/core-modules/application/services/application-sync-agent.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/core-modules/common/services/workspace-many-or-all-flat-entity-maps-cache.service.';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-validate-build-and-run-service';
import type { FlatObjectMetadataWithFlatFieldMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-with-flat-field-metadata-maps.type';
import { ObjectMetadataServiceV2 } from 'src/engine/metadata-modules/object-metadata/object-metadata-v2.service';
import { ApplicationManifest } from 'src/engine/core-modules/application/types/application-manifest.type';
import type { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';

export interface ApplicationSyncContext {
  workspaceId: string;
  featureFlags: Record<string, boolean>;
  applicationId: string;
}

@Injectable()
export class ApplicationSyncService {
  private readonly logger = new Logger(ApplicationSyncService.name);

  constructor(
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    private readonly localSourceProvider: LocalApplicationSourceProvider,
    private readonly applicationSyncAgentService: ApplicationSyncAgentService,
    private readonly applicationService: ApplicationService,
    private readonly objectMetadataServiceV2: ObjectMetadataServiceV2,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly dataSourceService: DataSourceService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {}

  public async synchronizeFromManifest(
    workspaceId: string,
    manifest: ApplicationManifest,
  ): Promise<ApplicationEntity> {
    this.logger.log(`Syncing application from manifest: ${manifest.label}`);

    // Find or create application
    let application = await this.applicationService.findByStandardId(
      manifest.standardId,
      workspaceId,
    );

    if (application.length === 0) {
      // Create new application
      application = [
        await this.applicationService.create({
          standardId: manifest.standardId,
          label: manifest.label,
          description: manifest.description,
          version: manifest.version,
          sourcePath: 'cli-sync', // Placeholder for CLI-synced apps
          workspaceId,
        }),
      ];
      this.logger.log(`Created new application: ${manifest.label}`);
    } else {
      // Update existing application
      const existingApp = application[0];

      await this.applicationService.update(existingApp.id, {
        label: manifest.label,
        description: manifest.description,
        version: manifest.version,
      });
      this.logger.log(`Updated existing application: ${manifest.label}`);
    }

    const app = application[0];

    // Sync agents
    if (manifest.agents && manifest.agents.length > 0) {
      const context: ApplicationSyncContext = {
        workspaceId,
        featureFlags: {}, // TODO: Get actual feature flags
        applicationId: app.id,
      };

      await this.applicationSyncAgentService.synchronize(
        context,
        manifest.agents,
      );
    }

    if (manifest.objects && manifest.objects.length > 0) {
      await this.syncObjects({
        objectsToSync: manifest.objects,
        workspaceId,
        applicationId: app.id,
      });
    }

    this.logger.log('✅ Application sync from manifest completed');

    return app;
  }

  private async syncObjects({
    objectsToSync,
    workspaceId,
    applicationId,
  }: {
    objectsToSync: FlatObjectMetadata[];
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

    const objectsToSyncNamesSingular = objectsToSync.map(
      (obj) => obj.nameSingular,
    );

    const applicationObjectsNamesSingular = applicationObjects.map(
      (obj) => obj.nameSingular,
    );

    const objectsToDelete = applicationObjects.filter(
      (obj) => !objectsToSyncNamesSingular.includes(obj.nameSingular),
    );

    const objectsToUpdate = applicationObjects.filter((obj) =>
      objectsToSyncNamesSingular.includes(obj.nameSingular),
    );

    const objectsToCreate = objectsToSync.filter(
      (objectToSync) =>
        !applicationObjectsNamesSingular.includes(objectToSync.nameSingular),
    );

    for (const objectToDelete of objectsToDelete) {
      await this.objectMetadataServiceV2.deleteOne({
        deleteObjectInput: objectToDelete,
        workspaceId,
      });
    }

    for (const objectToUpdate of objectsToUpdate) {
      const updateObjectInput = {
        id: objectToUpdate.id,
        update: {
          nameSingular: objectToUpdate.nameSingular,
          namePlural: objectToUpdate.namePlural,
          labelSingular: objectToUpdate.labelSingular,
          labelPlural: objectToUpdate.labelPlural,
          icon: objectToUpdate.icon || undefined,
          description: objectToUpdate.description || undefined,
        },
      };

      await this.objectMetadataServiceV2.updateOne({
        updateObjectInput,
        workspaceId,
      });
    }

    const dataSourceMetatada =
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
        dataSourceId: dataSourceMetatada.id,
      };

      await this.objectMetadataServiceV2.createOne({
        createObjectInput,
        workspaceId,
      });
    }
  }
}
