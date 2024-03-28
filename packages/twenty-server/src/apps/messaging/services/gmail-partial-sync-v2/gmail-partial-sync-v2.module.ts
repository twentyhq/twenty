import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { BlocklistObjectMetadata } from 'src/apps/connected-account/standard-objects/blocklist.object-metadata';
import { ConnectedAccountObjectMetadata } from 'src/apps/connected-account/standard-objects/connected-account.object-metadata';
import { FetchMessagesByBatchesModule } from 'src/apps/messaging/services/fetch-messages-by-batches/fetch-messages-by-batches.module';
import { GmailPartialSyncV2Service } from 'src/apps/messaging/services/gmail-partial-sync-v2/gmail-partial-sync-v2.service';
import { MessageModule } from 'src/apps/messaging/services/message/message.module';
import { MessagingProvidersModule } from 'src/apps/messaging/services/providers/messaging-providers.module';
import { SaveMessageAndEmitContactCreationEventModule } from 'src/apps/messaging/services/save-message-and-emit-contact-creation-event/save-message-and-emit-contact-creation-event.module';
import { MessageChannelObjectMetadata } from 'src/apps/messaging/standard-objects/message-channel.object-metadata';

@Module({
  imports: [
    MessagingProvidersModule,
    FetchMessagesByBatchesModule,
    ObjectMetadataRepositoryModule.forFeature([
      ConnectedAccountObjectMetadata,
      MessageChannelObjectMetadata,
      BlocklistObjectMetadata,
    ]),
    MessageModule,
    SaveMessageAndEmitContactCreationEventModule,
    TypeOrmModule.forFeature([FeatureFlagEntity], 'core'),
    WorkspaceDataSourceModule,
  ],
  providers: [GmailPartialSyncV2Service],
  exports: [GmailPartialSyncV2Service],
})
export class GmailPartialSyncV2Module {}
