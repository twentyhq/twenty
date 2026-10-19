import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillMemberRoleUniversalIdentifierCommand } from 'src/database/commands/upgrade-version-command/2-50/2-50-workspace-command-1792413669590-backfill-member-role-universal-identifier.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { RoleModule } from 'src/engine/metadata-modules/role/role.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    ApplicationModule,
    RoleModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
  ],
  providers: [BackfillMemberRoleUniversalIdentifierCommand],
})
export class V2_50_UpgradeVersionCommandModule {}
