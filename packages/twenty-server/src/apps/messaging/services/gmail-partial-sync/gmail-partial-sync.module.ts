import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { BlocklistObjectMetadata } from 'src/apps/connected-account/standard-objects/blocklist.object-metadata';
import { ConnectedAccountObjectMetadata } from 'src/apps/connected-account/standard-objects/connected-account.object-metadata';
import { FetchMessagesByBatchesModule } from 'src/apps/messaging/services/fetch-messages-by-batches/fetch-messages-by-batches.module';
import { GmailPartialSyncService } from 'src/apps/messaging/services/gmail-partial-sync/gmail-partial-sync.service';
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
  ],
  providers: [GmailPartialSyncService],
  exports: [GmailPartialSyncService],
})
export class GmailPartialSyncModule {}
