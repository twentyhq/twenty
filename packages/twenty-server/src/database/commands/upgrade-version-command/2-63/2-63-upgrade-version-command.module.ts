import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddRichTextFileIdsColumnsCommand } from 'src/database/commands/upgrade-version-command/2-63/2-63-workspace-command-1795431737341-add-rich-text-file-ids-columns.command';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [WorkspaceCacheModule, WorkspaceIteratorModule],
  providers: [AddRichTextFileIdsColumnsCommand],
})
export class V2_63_UpgradeVersionCommandModule {}
