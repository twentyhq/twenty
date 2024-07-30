import { Command, CommandRunner } from 'nest-commander';
import { EntityManager } from 'typeorm';

import { seedCoreSchema } from 'src/database/typeorm-seeds/core';
import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_TWENTY_WORKSPACE_ID,
} from 'src/database/typeorm-seeds/core/workspaces';
import { seedCalendarChannels } from 'src/database/typeorm-seeds/workspace/calendar-channel';
import { seedCalendarChannelEventAssociations } from 'src/database/typeorm-seeds/workspace/calendar-channel-event-association';
import { seedCalendarEventParticipants } from 'src/database/typeorm-seeds/workspace/calendar-event-participants';
import { seedCalendarEvents } from 'src/database/typeorm-seeds/workspace/calendar-events';
import { seedCompanies } from 'src/database/typeorm-seeds/workspace/companies';
import { seedConnectedAccount } from 'src/database/typeorm-seeds/workspace/connected-account';
import { seedMessageChannelMessageAssociation } from 'src/database/typeorm-seeds/workspace/message-channel-message-associations';
import { seedMessageChannel } from 'src/database/typeorm-seeds/workspace/message-channels';
import { seedMessageParticipant } from 'src/database/typeorm-seeds/workspace/message-participants';
import { seedMessageThread } from 'src/database/typeorm-seeds/workspace/message-threads';
import { seedMessage } from 'src/database/typeorm-seeds/workspace/messages';
import { seedOpportunity } from 'src/database/typeorm-seeds/workspace/opportunities';
import { seedPeople } from 'src/database/typeorm-seeds/workspace/people';
import { seedWorkspaceMember } from 'src/database/typeorm-seeds/workspace/workspace-members';
import { rawDataSource } from 'src/database/typeorm/raw/raw.datasource';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { CacheStorageService } from 'src/engine/integrations/cache-storage/cache-storage.service';
import { InjectCacheStorage } from 'src/engine/integrations/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageNamespace } from 'src/engine/integrations/cache-storage/types/cache-storage-namespace.enum';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { WorkspaceCacheVersionService } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.service';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { viewPrefillData } from 'src/engine/workspace-manager/standard-objects-prefill-data/view';
import { WorkspaceSyncMetadataService } from 'src/engine/workspace-manager/workspace-sync-metadata/workspace-sync-metadata.service';

// TODO: implement dry-run
@Command({
  name: 'workspace:seed:dev',
  description:
    'Seed workspace with initial data. This command is intended for development only.',
})
export class DataSeedWorkspaceCommand extends CommandRunner {
  workspaceIds = [SEED_APPLE_WORKSPACE_ID, SEED_TWENTY_WORKSPACE_ID];

  constructor(
    private readonly dataSourceService: DataSourceService,
    private readonly typeORMService: TypeORMService,
    private readonly workspaceSyncMetadataService: WorkspaceSyncMetadataService,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly objectMetadataService: ObjectMetadataService,
    @InjectCacheStorage(CacheStorageNamespace.WorkspaceSchema)
    private readonly workspaceSchemaCache: CacheStorageService,
    private readonly workspaceCacheVersionService: WorkspaceCacheVersionService,
  ) {
    super();
  }

  async run(): Promise<void> {
    try {
      for (const workspaceId of this.workspaceIds) {
        await this.workspaceSchemaCache.flush();
        await this.workspaceCacheVersionService.deleteVersion(workspaceId);

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
      console.error(error);

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

            await viewPrefillData(
              entityManager,
              dataSourceMetadata.schema,
              objectMetadataMap,
            );
          },
        );
      } catch (error) {
        console.error(error);
      }

      await this.typeORMService.disconnectFromDataSource(dataSourceMetadata.id);
    }
  }
}
