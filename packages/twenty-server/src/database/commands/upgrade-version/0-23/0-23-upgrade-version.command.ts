import { Command, CommandRunner, Option } from 'nest-commander';

import { UpdateFileFolderStructureCommand } from 'src/database/commands/upgrade-version/0-23/0-23-update-file-folder-structure.command';

interface UpdateTo0_23CommandOptions {
  workspaceId?: string;
}

@Command({
  name: 'upgrade-0.23',
  description: 'Upgrade to 0.23',
})
export class UpgradeTo0_23Command extends CommandRunner {
  constructor(
    private readonly updateFileFolderStructureCommandOptions: UpdateFileFolderStructureCommand,
  ) {
    super();
  }

  @Option({
    flags: '-w, --workspace-id [workspace_id]',
    description: 'workspace id. Command runs on all workspaces if not provided',
    required: false,
  })
  parseWorkspaceId(value: string): string {
    return value;
  }

  async run(
    _passedParam: string[],
    options: UpdateTo0_23CommandOptions,
  ): Promise<void> {
    await this.updateFileFolderStructureCommandOptions.run(
      _passedParam,
      options,
    );
  }
}
