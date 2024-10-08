import { Logger } from '@nestjs/common';

import { Command, CommandRunner } from 'nest-commander';
import { EntityManager } from 'typeorm';

import { seedCoreSchema } from 'src/database/typeorm-seeds/core';
import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_TWENTY_WORKSPACE_ID,
} from 'src/database/typeorm-seeds/core/workspaces';
import {
  getDevSeedCompanyCustomFields,
  getDevSeedPeopleCustomFields,
} from 'src/database/typeorm-seeds/metadata/fieldsMetadata';
import { getDevSeedCustomObjects } from 'src/database/typeorm-seeds/metadata/objectsMetadata';
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
import { seedMessageThreadSubscribers } from 'src/database/typeorm-seeds/workspace/message-thread-subscribers';
import { seedMessageThread } from 'src/database/typeorm-seeds/workspace/message-threads';
import { seedMessage } from 'src/database/typeorm-seeds/workspace/messages';
import { seedOpportunity } from 'src/database/typeorm-seeds/workspace/opportunities';
import { seedPeople } from 'src/database/typeorm-seeds/workspace/people';
import { seedWorkspaceMember } from 'src/database/typeorm-seeds/workspace/workspace-members';
import { rawDataSource } from 'src/database/typeorm/raw/raw.datasource';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/field-metadata.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { shouldSeedWorkspaceFavorite } from 'src/engine/utils/should-seed-workspace-favorite';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { viewPrefillData } from 'src/engine/workspace-manager/standard-objects-prefill-data/view';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { WorkspaceSyncMetadataService } from 'src/engine/workspace-manager/workspace-sync-metadata/workspace-sync-metadata.service';

// TODO: implement dry-run
@Command({
  name: 'workspace:seed:dev',
  description:
    'Seed workspace with initial data. This command is intended for development only.',
})
export class DataSeedWorkspaceCommand extends CommandRunner {
  workspaceIds = [SEED_APPLE_WORKSPACE_ID, SEED_TWENTY_WORKSPACE_ID];
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
  ) {
    super();
  }

  async run(): Promise<void> {
    try {
      for (const workspaceId of this.workspaceIds) {
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
    } catch (error) {
      this.logger.error(error);

      return;
    }

    for (const workspaceId of this.workspaceIds) {
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
        const objectMetadata =
          await this.objectMetadataService.findManyWithinWorkspace(workspaceId);
        const objectMetadataMap = objectMetadata.reduce((acc, object) => {
          acc[object.standardId ?? ''] = {
            id: object.id,
            fields: object.fields.reduce((acc, field) => {
              acc[field.standardId ?? ''] = field.id;

              return acc;
            }, {}),
          };

          return acc;
        }, {});

        const isMessageThreadSubscriberEnabled =
          await this.featureFlagService.isFeatureEnabled(
            FeatureFlagKey.IsMessageThreadSubscriberEnabled,
            workspaceId,
          );

        const isWorkflowEnabled =
          await this.featureFlagService.isFeatureEnabled(
            FeatureFlagKey.IsWorkflowEnabled,
            workspaceId,
          );

        await this.seedCompanyCustomFields(
          objectMetadataMap[STANDARD_OBJECT_IDS.company],
          workspaceId,
        );
        await this.seedPeopleCustomFields(
          objectMetadataMap[STANDARD_OBJECT_IDS.person],
          workspaceId,
        );
        await this.seedCustomObjects(workspaceId, dataSourceMetadata.id);

        await workspaceDataSource.transaction(
          async (entityManager: EntityManager) => {
            await seedCompanies(entityManager, dataSourceMetadata.schema);
            await seedPeople(entityManager, dataSourceMetadata.schema);
            await seedOpportunity(entityManager, dataSourceMetadata.schema);
            await seedWorkspaceMember(
              entityManager,
              dataSourceMetadata.schema,
              workspaceId,
            );

            if (workspaceId === SEED_APPLE_WORKSPACE_ID) {
              await seedMessageThread(entityManager, dataSourceMetadata.schema);
              await seedConnectedAccount(
                entityManager,
                dataSourceMetadata.schema,
              );

              if (isMessageThreadSubscriberEnabled) {
                await seedMessageThreadSubscribers(
                  entityManager,
                  dataSourceMetadata.schema,
                );
              }

              await seedMessage(entityManager, dataSourceMetadata.schema);
              await seedMessageChannel(
                entityManager,
                dataSourceMetadata.schema,
              );
              await seedMessageChannelMessageAssociation(
                entityManager,
                dataSourceMetadata.schema,
              );
              await seedMessageParticipant(
                entityManager,
                dataSourceMetadata.schema,
              );

              await seedCalendarEvents(
                entityManager,
                dataSourceMetadata.schema,
              );
              await seedCalendarChannels(
                entityManager,
                dataSourceMetadata.schema,
              );
              await seedCalendarChannelEventAssociations(
                entityManager,
                dataSourceMetadata.schema,
              );
              await seedCalendarEventParticipants(
                entityManager,
                dataSourceMetadata.schema,
              );
            }

            const viewDefinitionsWithId = await viewPrefillData(
              entityManager,
              dataSourceMetadata.schema,
              objectMetadataMap,
              isWorkflowEnabled,
            );

            await seedWorkspaceFavorites(
              viewDefinitionsWithId
                .filter(
                  (view) =>
                    view.key === 'INDEX' &&
                    shouldSeedWorkspaceFavorite(
                      view.objectMetadataId,
                      objectMetadataMap,
                    ),
                )
                .map((view) => view.id),
              entityManager,
              dataSourceMetadata.schema,
            );
          },
        );
      } catch (error) {
        this.logger.error(error);
      }

      await this.typeORMService.disconnectFromDataSource(dataSourceMetadata.id);
    }
  }

  async seedCompanyCustomFields(
    companyObjectMetadata: ObjectMetadataEntity,
    workspaceId: string,
  ) {
    const companyObjectMetadataId = companyObjectMetadata?.id;

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
    personObjectMetadata: ObjectMetadataEntity,
    workspaceId: string,
  ) {
    const personObjectMetadataId = personObjectMetadata?.id;

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

  async seedCustomObjects(workspaceId: string, dataSourceId: string) {
    const devSeedCustomObjects = getDevSeedCustomObjects(
      workspaceId,
      dataSourceId,
    );

    for (const customObject of devSeedCustomObjects) {
      await this.objectMetadataService.createOne(customObject);
    }
  }
}
