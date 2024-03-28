import { Module } from '@nestjs/common';

import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { MessageThreadModule } from 'src/apps/messaging/services/message-thread/message-thread.module';
import { MessageService } from 'src/apps/messaging/services/message/message.service';
import { MessageChannelMessageAssociationObjectMetadata } from 'src/apps/messaging/standard-objects/message-channel-message-association.object-metadata';
import { MessageChannelObjectMetadata } from 'src/apps/messaging/standard-objects/message-channel.object-metadata';
import { MessageThreadObjectMetadata } from 'src/apps/messaging/standard-objects/message-thread.object-metadata';
import { MessageObjectMetadata } from 'src/apps/messaging/standard-objects/message.object-metadata';

@Module({
  imports: [
    WorkspaceDataSourceModule,
    ObjectMetadataRepositoryModule.forFeature([
      MessageChannelMessageAssociationObjectMetadata,
      MessageObjectMetadata,
      MessageChannelObjectMetadata,
      MessageThreadObjectMetadata,
    ]),
    MessageThreadModule,
  ],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
