import { Command, CommandRunner, Option } from 'nest-commander';

import { MigrateLinkFieldsToLinksCommand } from 'src/database/commands/upgrade-version/0-23/0-23-migrate-link-fields-to-links.command';

interface Options {
  workspaceId?: string;
}

@Command({
  name: 'upgrade-0.23',
  description: 'Upgrade to 0.23',
})
export class UpgradeTo0_23Command extends CommandRunner {
  constructor(
    private readonly migrateLinkFieldsToLinks: MigrateLinkFieldsToLinksCommand,
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

  async run(_passedParam: string[], options: Options): Promise<void> {
    await this.migrateLinkFieldsToLinks.run(_passedParam, options);
  }
}
