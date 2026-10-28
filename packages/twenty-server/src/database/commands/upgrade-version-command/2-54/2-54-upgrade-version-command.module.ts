import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { StripServerRoutesFromCustomAppLogicFunctionsCommand } from 'src/database/commands/upgrade-version-command/2-54/2-54-workspace-command-1793205683162-strip-server-routes-from-custom-app-logic-functions.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [ApplicationModule, WorkspaceCacheModule, WorkspaceIteratorModule],
  providers: [StripServerRoutesFromCustomAppLogicFunctionsCommand],
})
export class V2_54_UpgradeVersionCommandModule {}
