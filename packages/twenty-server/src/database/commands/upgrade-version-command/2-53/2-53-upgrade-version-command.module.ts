import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { FlushObjectMetadataAfterApplicationWritabilityMoveCommand } from 'src/database/commands/upgrade-version-command/2-53/2-53-workspace-command-1793129132001-flush-object-metadata-after-application-writability-move.command';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [WorkspaceCacheModule, WorkspaceIteratorModule],
  providers: [FlushObjectMetadataAfterApplicationWritabilityMoveCommand],
})
export class V2_53_UpgradeVersionCommandModule {}
