import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { ResyncCompanyDomainNameAndAuditCommand } from 'src/database/commands/upgrade-version-command/2-2/2-2-workspace-command-1798000001000-resync-company-domain-name-and-audit.command';
import { SetCalendarEventDescriptionDisplayedMaxRowsCommand } from 'src/database/commands/upgrade-version-command/2-2/2-2-workspace-command-1786000000000-set-calendar-event-description-displayed-max-rows.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { GlobalWorkspaceDataSourceModule } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-datasource.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { TwentyStandardApplicationModule } from 'src/engine/workspace-manager/twenty-standard-application/twenty-standard-application.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    GlobalWorkspaceDataSourceModule,
    TwentyStandardApplicationModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    SetCalendarEventDescriptionDisplayedMaxRowsCommand,
    ResyncCompanyDomainNameAndAuditCommand,
  ],
})
export class V2_2_UpgradeVersionCommandModule {}
