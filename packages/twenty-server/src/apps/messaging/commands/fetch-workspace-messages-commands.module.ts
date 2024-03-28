import { Module } from '@nestjs/common';

import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { ConnectedAccountObjectMetadata } from 'src/apps/connected-account/standard-objects/connected-account.object-metadata';
import { GmailFullSyncCommand } from 'src/apps/messaging/commands/gmail-full-sync.command';
import { GmailPartialSyncCommand } from 'src/apps/messaging/commands/gmail-partial-sync.command';
import { StartFetchAllWorkspacesMessagesFromCacheCronCommand } from 'src/apps/messaging/commands/start-fetch-all-workspaces-messages-from-cache.cron.command';
import { StartFetchAllWorkspacesMessagesCronCommand } from 'src/apps/messaging/commands/start-fetch-all-workspaces-messages.cron.command';
import { StopFetchAllWorkspacesMessagesCronCommand } from 'src/apps/messaging/commands/stop-fetch-all-workspaces-messages.cron.command';

@Module({
  imports: [
    ObjectMetadataRepositoryModule.forFeature([ConnectedAccountObjectMetadata]),
  ],
  providers: [
    GmailFullSyncCommand,
    GmailPartialSyncCommand,
    StartFetchAllWorkspacesMessagesCronCommand,
    StopFetchAllWorkspacesMessagesCronCommand,
    StartFetchAllWorkspacesMessagesFromCacheCronCommand,
  ],
})
export class FetchWorkspaceMessagesCommandsModule {}
