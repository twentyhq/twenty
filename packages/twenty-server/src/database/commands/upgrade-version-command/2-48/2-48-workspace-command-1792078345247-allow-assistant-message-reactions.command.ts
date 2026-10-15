import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

const WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.agentMessageReaction.fields.workspaceMember
    .universalIdentifier;

@RegisteredWorkspaceCommand('2.48.0', 1792078345247)
@Command({
  name: 'upgrade:2-48:allow-assistant-message-reactions',
  description:
    'Let a chat message reaction belong to the assistant instead of a workspace member',
})
export class AllowAssistantMessageReactionsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up(args: RunOnWorkspaceArgs): Promise<void> {
    await this.setWorkspaceMemberNullable({ ...args, isNullable: true });
  }

  async down(args: RunOnWorkspaceArgs): Promise<void> {
    await this.setWorkspaceMemberNullable({ ...args, isNullable: false });
  }

  private async setWorkspaceMemberNullable({
    workspaceId,
    options,
    dataSource,
    isNullable,
  }: RunOnWorkspaceArgs & { isNullable: boolean }): Promise<void> {
    if (!isDefined(dataSource) || (options.dryRun ?? false)) {
      return;
    }

    const reactionTable = `"${getWorkspaceSchemaName(workspaceId)}"."agentMessageReaction"`;
    const [table] = await dataSource.query('SELECT to_regclass($1) AS name', [
      reactionTable,
    ]);

    if (!isDefined(table?.name)) {
      return;
    }

    if (!isNullable) {
      await dataSource.query(
        `DELETE FROM ${reactionTable} WHERE "workspaceMemberId" IS NULL`,
      );
    }

    await dataSource.query(
      `ALTER TABLE ${reactionTable} ALTER COLUMN "workspaceMemberId" ${isNullable ? 'DROP' : 'SET'} NOT NULL`,
    );
    await dataSource.query(
      `UPDATE core."fieldMetadata" SET "isNullable" = $1
       WHERE "workspaceId" = $2 AND "universalIdentifier" = $3`,
      [isNullable, workspaceId, WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER],
    );
    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatFieldMetadataMaps',
    ]);
  }
}
