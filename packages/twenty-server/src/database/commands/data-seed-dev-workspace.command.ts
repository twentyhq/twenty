import { Logger } from '@nestjs/common';

import { Command, CommandRunner } from 'nest-commander';
import { DataSource, EntityManager } from 'typeorm';

import { seedCoreSchema } from 'src/database/typeorm-seeds/core';
import {
  SEED_ACME_WORKSPACE_ID,
  SEED_APPLE_WORKSPACE_ID,
} from 'src/database/typeorm-seeds/core/workspaces';
import {
  getDevSeedCompanyCustomFields,
  getDevSeedPeopleCustomFields,
} from 'src/database/typeorm-seeds/metadata/fieldsMetadata';
import { seedCalendarChannels } from 'src/database/typeorm-seeds/workspace/calendar-channel';
import { seedCalendarChannelEventAssociations } from 'src/database/typeorm-seeds/workspace/calendar-channel-event-association';
import { seedCalendarEventParticipants } from 'src/database/typeorm-seeds/workspace/calendar-event-participants';
import { seedCalendarEvents } from 'src/database/typeorm-seeds/workspace/calendar-events';
import { seedCompanies } from 'src/database/typeorm-seeds/workspace/companies';
import { seedConnectedAccount } from 'src/database/typeorm-seeds/workspace/connected-account';
import { seedWorkspaceFavorites } from 'src/database/typeorm-seeds/workspace/favorites';
import { seedMessageChannelMessageAssociation } from 'src/database/typeorm-seeds/workspace/message-channel-message-associations';
import { seedMessageChannel } from 'src/database/typeorm-seeds/workspace/message-channels';
import { seedMessageParticipant } from 'src/database/typeorm-seeds/workspace/message-participants';
import { seedMessageThread } from 'src/database/typeorm-seeds/workspace/message-threads';
import { seedMessage } from 'src/database/typeorm-seeds/workspace/messages';
import { seedOpportunity } from 'src/database/typeorm-seeds/workspace/opportunities';
import { seedPeople } from 'src/database/typeorm-seeds/workspace/seedPeople';
import { seedWorkspaceMember } from 'src/database/typeorm-seeds/workspace/workspace-members';
import { rawDataSource } from 'src/database/typeorm/raw/raw.datasource';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/field-metadata.service';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { PETS_DATA_SEEDS } from 'src/engine/seeder/data-seeds/pets-data-seeds';
import { SURVEY_RESULTS_DATA_SEEDS } from 'src/engine/seeder/data-seeds/survey-results-data-seeds';
import { PETS_METADATA_SEEDS } from 'src/engine/seeder/metadata-seeds/pets-metadata-seeds';
import { SURVEY_RESULTS_METADATA_SEEDS } from 'src/engine/seeder/metadata-seeds/survey-results-metadata-seeds';
import { SeederService } from 'src/engine/seeder/seeder.service';
import { shouldSeedWorkspaceFavorite } from 'src/engine/utils/should-seed-workspace-favorite';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { createWorkspaceViews } from 'src/engine/workspace-manager/standard-objects-prefill-data/create-workspace-views';
import { seedViewWithDemoData } from 'src/engine/workspace-manager/standard-objects-prefill-data/seed-view-with-demo-data';
import { opportunitiesTableByStageView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/opportunity-table-by-stage.view';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { WorkspaceSyncMetadataService } from 'src/engine/workspace-manager/workspace-sync-metadata/workspace-sync-metadata.service';

// TODO: implement dry-run
@Command({
  name: 'workspace:seed:dev',
  description:
    'Seed workspace with initial data. This command is intended for development only.',
})
export class DataSeedWorkspaceCommand extends CommandRunner {
  workspaceIds = [SEED_APPLE_WORKSPACE_ID, SEED_ACME_WORKSPACE_ID];
  private readonly logger = new Logger(DataSeedWorkspaceCommand.name);

  constructor(
    private readonly dataSourceService: DataSourceService,
    private readonly typeORMService: TypeORMService,
    private readonly workspaceSyncMetadataService: WorkspaceSyncMetadataService,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly fieldMetadataService: FieldMetadataService,
    private readonly objectMetadataService: ObjectMetadataService,
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    private readonly workspaceSchemaCache: CacheStorageService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly seederService: SeederService,
  ) {
    super();
  }

  async run(): Promise<void> {
    try {
      for (const workspaceId of this.workspaceIds) {
        await this.createWorkspaceSchema(workspaceId);
      }
    } catch (error) {
      this.logger.error(error);

      return;
    }

    for (const workspaceId of this.workspaceIds) {
      await this.seedWorkspace(workspaceId);
    }
  }

  async createWorkspaceSchema(workspaceId: string) {
    await this.workspaceSchemaCache.flush();

    await rawDataSource.initialize();

    await seedCoreSchema(rawDataSource, workspaceId);

    await rawDataSource.destroy();

    const schemaName =
      await this.workspaceDataSourceService.createWorkspaceDBSchema(
        workspaceId,
      );

    const dataSourceMetadata =
      await this.dataSourceService.createDataSourceMetadata(
        workspaceId,
        schemaName,
      );

    await this.workspaceSyncMetadataService.synchronize({
      workspaceId: workspaceId,
      dataSourceId: dataSourceMetadata.id,
    });
  }

  async seedWorkspace(workspaceId: string) {
    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspaceId,
      );

    const workspaceDataSource =
      await this.typeORMService.connectToDataSource(dataSourceMetadata);

    if (!workspaceDataSource) {
      throw new Error('Could not connect to workspace data source');
    }

    try {
      const { objectMetadataStandardIdToIdMap } =
        await this.objectMetadataService.getObjectMetadataStandardIdToIdMap(
          workspaceId,
        );

      await this.seedCompanyCustomFields(
        objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.company].id,
        workspaceId,
      );

      await this.seedPeopleCustomFields(
        objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.person].id,
        workspaceId,
      );

      await this.seedStandardObjectRecords(
        workspaceDataSource,
        dataSourceMetadata,
      );

      await this.seederService.seedCustomObjects(
        dataSourceMetadata.id,
        workspaceId,
        PETS_METADATA_SEEDS,
        PETS_DATA_SEEDS,
      );

      await this.seederService.seedCustomObjects(
        dataSourceMetadata.id,
        workspaceId,
        SURVEY_RESULTS_METADATA_SEEDS,
        SURVEY_RESULTS_DATA_SEEDS,
      );
    } catch (error) {
      this.logger.error(error);
    }

    await this.typeORMService.disconnectFromDataSource(dataSourceMetadata.id);
  }

  async seedStandardObjectRecords(
    workspaceDataSource: DataSource,
    dataSourceMetadata: DataSourceEntity,
  ) {
    await workspaceDataSource.transaction(
      async (entityManager: EntityManager) => {
        const { objectMetadataStandardIdToIdMap } =
          await this.objectMetadataService.getObjectMetadataStandardIdToIdMap(
            dataSourceMetadata.workspaceId,
          );

        const isWorkflowEnabled =
          await this.featureFlagService.isFeatureEnabled(
            FeatureFlagKey.IsWorkflowEnabled,
            dataSourceMetadata.workspaceId,
          );

        await seedCompanies(entityManager, dataSourceMetadata.schema);
        await seedPeople(entityManager, dataSourceMetadata.schema);
        await seedOpportunity(entityManager, dataSourceMetadata.schema);
        await seedWorkspaceMember(
          entityManager,
          dataSourceMetadata.schema,
          dataSourceMetadata.workspaceId,
        );

        if (dataSourceMetadata.workspaceId === SEED_APPLE_WORKSPACE_ID) {
          await seedMessageThread(entityManager, dataSourceMetadata.schema);
          await seedConnectedAccount(entityManager, dataSourceMetadata.schema);

          await seedMessage(entityManager, dataSourceMetadata.schema);
          await seedMessageChannel(entityManager, dataSourceMetadata.schema);
          await seedMessageChannelMessageAssociation(
            entityManager,
            dataSourceMetadata.schema,
          );
          await seedMessageParticipant(
            entityManager,
            dataSourceMetadata.schema,
          );

          await seedCalendarEvents(entityManager, dataSourceMetadata.schema);
          await seedCalendarChannels(entityManager, dataSourceMetadata.schema);
          await seedCalendarChannelEventAssociations(
            entityManager,
            dataSourceMetadata.schema,
          );
          await seedCalendarEventParticipants(
            entityManager,
            dataSourceMetadata.schema,
          );
        }

        const viewDefinitionsWithId = await seedViewWithDemoData(
          entityManager,
          dataSourceMetadata.schema,
          objectMetadataStandardIdToIdMap,
          isWorkflowEnabled,
        );

        const devViewDefinitionsWithId = await createWorkspaceViews(
          entityManager,
          dataSourceMetadata.schema,
          [opportunitiesTableByStageView(objectMetadataStandardIdToIdMap)],
        );

        viewDefinitionsWithId.push(...devViewDefinitionsWithId);

        await seedWorkspaceFavorites(
          viewDefinitionsWithId
            .filter(
              (view) =>
                view.key === 'INDEX' &&
                shouldSeedWorkspaceFavorite(
                  view.objectMetadataId,
                  objectMetadataStandardIdToIdMap,
                ),
            )
            .map((view) => view.id),
          entityManager,
          dataSourceMetadata.schema,
        );
      },
    );
  }

  async seedCompanyCustomFields(
    companyObjectMetadataId: string,
    workspaceId: string,
  ) {
    if (!companyObjectMetadataId) {
      throw new Error(
        `Company object metadata not found for workspace ${workspaceId}, can't seed custom fields`,
      );
    }

    const DEV_SEED_COMPANY_CUSTOM_FIELDS = getDevSeedCompanyCustomFields(
      companyObjectMetadataId,
      workspaceId,
    );

    for (const customField of DEV_SEED_COMPANY_CUSTOM_FIELDS) {
      // TODO: Use createMany once implemented for better performances
      await this.fieldMetadataService.createOne({
        ...customField,
        isCustom: true,
      });
    }
  }

  async seedPeopleCustomFields(
    personObjectMetadataId: string,
    workspaceId: string,
  ) {
    if (!personObjectMetadataId) {
      throw new Error(
        `Person object metadata not found for workspace ${workspaceId}, can't seed custom fields`,
      );
    }

    const DEV_SEED_PERSON_CUSTOM_FIELDS = getDevSeedPeopleCustomFields(
      personObjectMetadataId,
      workspaceId,
    );

    for (const customField of DEV_SEED_PERSON_CUSTOM_FIELDS) {
      await this.fieldMetadataService.createOne({
        ...customField,
        isCustom: true,
      });
    }
  }
}
