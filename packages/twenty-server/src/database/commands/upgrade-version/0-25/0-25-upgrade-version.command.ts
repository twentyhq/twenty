import { Command, CommandRunner, Option } from 'nest-commander';

import { MigrateEmailFieldsToEmailsCommand } from 'src/database/commands/upgrade-version/0-25/0-25-migrate-email-fields-to-emails.command';
import { SyncWorkspaceMetadataCommand } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/sync-workspace-metadata.command';

interface UpdateTo0_25CommandOptions {
  workspaceId?: string;
}

@Command({
  name: 'upgrade-0.25',
  description: 'Upgrade to 0.25',
})
export class UpgradeTo0_25Command extends CommandRunner {
  constructor(
    private readonly syncWorkspaceMetadataCommand: SyncWorkspaceMetadataCommand,
    private readonly migrateEmailFieldsToEmails: MigrateEmailFieldsToEmailsCommand,
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
    passedParam: string[],
    options: UpdateTo0_25CommandOptions,
  ): Promise<void> {
    await this.migrateEmailFieldsToEmails.run(passedParam, options);
    await this.syncWorkspaceMetadataCommand.run(passedParam, {
      ...options,
      force: true,
    });
  }
}
