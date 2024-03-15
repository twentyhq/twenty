import { Module } from '@nestjs/common';

import { MessageChannelService } from 'src/business/modules/message/repositories/message-channel/message-channel.service';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [WorkspaceDataSourceModule],
  providers: [MessageChannelService],
  exports: [MessageChannelService],
})
export class MessageChannelModule {}
