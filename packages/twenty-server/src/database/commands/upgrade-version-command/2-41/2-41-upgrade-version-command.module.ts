import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { CanonicalizeEmailDomainsCommand } from 'src/database/commands/upgrade-version-command/2-41/2-41-workspace-command-1789154318369-canonicalize-email-domains.command';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [WorkspaceCacheModule, WorkspaceIteratorModule],
  providers: [CanonicalizeEmailDomainsCommand],
})
export class V2_41_UpgradeVersionCommandModule {}
