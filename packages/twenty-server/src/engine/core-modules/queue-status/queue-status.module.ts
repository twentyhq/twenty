import { Module } from '@nestjs/common';

import { AdminPanelModule } from 'src/engine/core-modules/admin-panel/admin-panel.module';
import { QueueStatusResolver } from 'src/engine/core-modules/queue-status/queue-status.resolver';

@Module({
  imports: [AdminPanelModule],
  providers: [QueueStatusResolver],
})
export class QueueStatusModule {}
