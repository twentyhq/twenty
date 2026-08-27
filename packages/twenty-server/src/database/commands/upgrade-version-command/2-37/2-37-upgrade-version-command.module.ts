import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { NormalizeWorkflowRecordCrudRichTextFieldsCommand } from 'src/database/commands/upgrade-version-command/2-37/2-37-workspace-command-1787827154863-normalize-workflow-record-crud-rich-text-fields.command';
import { WorkflowVersionCoreModule } from 'src/engine/core-modules/workflow/workflow-version-core.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    WorkflowVersionCoreModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
  ],
  providers: [NormalizeWorkflowRecordCrudRichTextFieldsCommand],
})
export class V2_37_UpgradeVersionCommandModule {}
