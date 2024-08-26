import { Command, CommandRunner, Option } from 'nest-commander';

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
  }
}
