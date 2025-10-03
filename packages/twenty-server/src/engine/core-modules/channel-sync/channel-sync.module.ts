import { Module } from '@nestjs/common';

import { ChannelSyncResolver } from 'src/engine/core-modules/channel-sync/channel-sync.resolver';
import { ChannelSyncService } from 'src/engine/core-modules/channel-sync/services/channel-sync.service';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [WorkspaceDataSourceModule],
  providers: [ChannelSyncResolver, ChannelSyncService],
  exports: [ChannelSyncService],
})
export class ChannelSyncModule {}
