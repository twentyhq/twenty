import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { StripServerRoutesFromCustomAppLogicFunctionsCommand } from 'src/database/commands/upgrade-version-command/2-54/2-54-workspace-command-1793265069585-strip-server-routes-from-custom-app-logic-functions.command';
import { UpdateCrmHygieneSkillMergeGuidanceCommand } from 'src/database/commands/upgrade-version-command/2-54/2-54-workspace-command-1793206127866-update-crm-hygiene-skill-merge-guidance.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    StripServerRoutesFromCustomAppLogicFunctionsCommand,
    UpdateCrmHygieneSkillMergeGuidanceCommand,
  ],
})
export class V2_54_UpgradeVersionCommandModule {}
