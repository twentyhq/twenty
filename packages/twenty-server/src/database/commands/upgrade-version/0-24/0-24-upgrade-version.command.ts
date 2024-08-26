import { Command, CommandRunner, Option } from 'nest-commander';

import { SetMessageDirectionCommand } from 'src/database/commands/upgrade-version/0-24/0-24-set-message-direction.command';
import { SyncWorkspaceMetadataCommand } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/sync-workspace-metadata.command';

interface UpdateTo0_24CommandOptions {
  workspaceId?: string;
}

@Command({
  name: 'upgrade-0.24',
  description: 'Upgrade to 0.24',
})
export class UpgradeTo0_24Command extends CommandRunner {
  constructor(
    private readonly syncWorkspaceMetadataCommand: SyncWorkspaceMetadataCommand,
    private readonly setMessagesDirectionCommand: SetMessageDirectionCommand,
  ) {
    super();
  }

  @Option({
    flags: '-w, --workspace-id [workspace_id]',
    description:
      'workspace id. Command runs on all active workspaces if not provided',
    required: false,
  })
  parseWorkspaceId(value: string): string {
    return value;
  }

  async run(
    _passedParam: string[],
    options: UpdateTo0_24CommandOptions,
  ): Promise<void> {
    await this.syncWorkspaceMetadataCommand.run(_passedParam, {
      ...options,
      force: true,
    });
    await this.setMessagesDirectionCommand.run(_passedParam, options);
  }
}
