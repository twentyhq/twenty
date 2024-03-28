import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { BlocklistObjectMetadata } from 'src/apps/connected-account/standard-objects/blocklist.object-metadata';
import { ConnectedAccountObjectMetadata } from 'src/apps/connected-account/standard-objects/connected-account.object-metadata';
import { FetchMessagesByBatchesModule } from 'src/apps/messaging/services/fetch-messages-by-batches/fetch-messages-by-batches.module';
import { GmailFullSyncService } from 'src/apps/messaging/services/gmail-full-sync/gmail-full-sync.service';
import { MessagingProvidersModule } from 'src/apps/messaging/services/providers/messaging-providers.module';
import { SaveMessageAndEmitContactCreationEventModule } from 'src/apps/messaging/services/save-message-and-emit-contact-creation-event/save-message-and-emit-contact-creation-event.module';
import { MessageChannelMessageAssociationObjectMetadata } from 'src/apps/messaging/standard-objects/message-channel-message-association.object-metadata';
import { MessageChannelObjectMetadata } from 'src/apps/messaging/standard-objects/message-channel.object-metadata';

@Module({
  imports: [
    MessagingProvidersModule,
    FetchMessagesByBatchesModule,
    ObjectMetadataRepositoryModule.forFeature([
      ConnectedAccountObjectMetadata,
      MessageChannelObjectMetadata,
      MessageChannelMessageAssociationObjectMetadata,
      BlocklistObjectMetadata,
    ]),
    SaveMessageAndEmitContactCreationEventModule,
    TypeOrmModule.forFeature([FeatureFlagEntity], 'core'),
  ],
  providers: [GmailFullSyncService],
  exports: [GmailFullSyncService],
})
export class GmailFullSyncModule {}
