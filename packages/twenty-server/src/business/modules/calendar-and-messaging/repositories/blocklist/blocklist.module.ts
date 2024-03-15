import { Module } from '@nestjs/common';

import { BlocklistService } from 'src/business/modules/calendar-and-messaging/repositories/blocklist/blocklist.service';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [WorkspaceDataSourceModule],
  providers: [BlocklistService],
  exports: [BlocklistService],
})
export class BlocklistModule {}
