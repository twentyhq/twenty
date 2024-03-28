import { Module } from '@nestjs/common';

import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { ConnectedAccountObjectMetadata } from 'src/apps/connected-account/standard-objects/connected-account.object-metadata';
import { FetchMessagesByBatchesModule } from 'src/apps/messaging/services/fetch-messages-by-batches/fetch-messages-by-batches.module';
import { GmailFetchMessageContentFromCacheService } from 'src/apps/messaging/services/gmail-fetch-message-content-from-cache/gmail-fetch-message-content-from-cache.service';
import { MessageModule } from 'src/apps/messaging/services/message/message.module';
import { SaveMessageAndEmitContactCreationEventModule } from 'src/apps/messaging/services/save-message-and-emit-contact-creation-event/save-message-and-emit-contact-creation-event.module';
import { MessageChannelObjectMetadata } from 'src/apps/messaging/standard-objects/message-channel.object-metadata';

@Module({
  imports: [
    FetchMessagesByBatchesModule,
    ObjectMetadataRepositoryModule.forFeature([
      ConnectedAccountObjectMetadata,
      MessageChannelObjectMetadata,
    ]),
    SaveMessageAndEmitContactCreationEventModule,
    MessageModule,
    WorkspaceDataSourceModule,
  ],
  providers: [GmailFetchMessageContentFromCacheService],
  exports: [GmailFetchMessageContentFromCacheService],
})
export class GmailFetchMessageContentFromCacheModule {}
