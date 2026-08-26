import { Module } from '@nestjs/common';

import { MessageCalendarTargetReadinessService } from 'src/engine/core-modules/target/services/message-calendar-target-readiness.service';
import { UpgradeStatusModule } from 'src/engine/core-modules/upgrade/upgrade-status.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [UpgradeStatusModule, WorkspaceCacheModule],
  providers: [MessageCalendarTargetReadinessService],
  exports: [MessageCalendarTargetReadinessService],
})
export class TargetModule {}
