import { Module } from '@nestjs/common';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { MessageCalendarTargetReadinessService } from 'src/engine/core-modules/target/services/message-calendar-target-readiness.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [FeatureFlagModule, WorkspaceCacheModule],
  providers: [MessageCalendarTargetReadinessService],
  exports: [MessageCalendarTargetReadinessService],
})
export class TargetModule {}
