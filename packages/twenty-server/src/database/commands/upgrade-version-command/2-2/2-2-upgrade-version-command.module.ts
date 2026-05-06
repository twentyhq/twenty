import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { ResyncCompanyDomainNameAndAuditCommand } from 'src/database/commands/upgrade-version-command/2-2/2-2-workspace-command-1798000001000-resync-company-domain-name-and-audit.command';
import { GlobalWorkspaceDataSourceModule } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-datasource.module';
import { TwentyStandardApplicationModule } from 'src/engine/workspace-manager/twenty-standard-application/twenty-standard-application.module';

@Module({
  imports: [
    GlobalWorkspaceDataSourceModule,
    TwentyStandardApplicationModule,
    WorkspaceIteratorModule,
  ],
  providers: [ResyncCompanyDomainNameAndAuditCommand],
})
export class V2_2_UpgradeVersionCommandModule {}
