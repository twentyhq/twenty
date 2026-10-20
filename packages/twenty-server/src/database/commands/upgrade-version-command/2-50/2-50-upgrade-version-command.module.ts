import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillCompanyOpportunityTargetsCommand } from 'src/database/commands/upgrade-version-command/2-50/2-50-workspace-command-1792489506688-backfill-company-opportunity-targets.command';

@Module({
  imports: [WorkspaceIteratorModule],
  providers: [BackfillCompanyOpportunityTargetsCommand],
})
export class V2_50_UpgradeVersionCommandModule {}
