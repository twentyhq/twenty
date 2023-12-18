import { Module } from '@nestjs/common';

import { IntelligenceService } from 'src/core/quick-actions/intelligence.service';
import { QuickActionsService } from 'src/core/quick-actions/quick-actions.service';
import { WorkspaceQueryRunnerModule } from 'src/workspace/workspace-query-runner/workspace-query-runner.module';

@Module({
  imports: [WorkspaceQueryRunnerModule],
  controllers: [],
  providers: [QuickActionsService, IntelligenceService],
  exports: [QuickActionsService, IntelligenceService],
})
export class QuickActionsModule {}
