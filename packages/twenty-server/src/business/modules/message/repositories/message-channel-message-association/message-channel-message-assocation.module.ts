import { Module } from '@nestjs/common';

import { MessageChannelMessageAssociationService } from 'src/business/modules/message/repositories/message-channel-message-association/message-channel-message-association.service';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [WorkspaceDataSourceModule],
  providers: [MessageChannelMessageAssociationService],
  exports: [MessageChannelMessageAssociationService],
})
export class MessageChannelMessageAssociationModule {}
