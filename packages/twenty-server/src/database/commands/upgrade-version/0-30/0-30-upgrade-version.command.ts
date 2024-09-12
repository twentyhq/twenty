import { Command, CommandRunner, Option } from 'nest-commander';

import { MigrateEmailFieldsToEmailsCommand } from 'src/database/commands/upgrade-version/0-30/0-30-migrate-email-fields-to-emails.command';
import { SetCustomObjectIsSoftDeletableCommand } from 'src/database/commands/upgrade-version/0-30/0-30-set-custom-object-is-soft-deletable.command';
import { SyncWorkspaceMetadataCommand } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/sync-workspace-metadata.command';

interface UpdateTo0_30CommandOptions {
  workspaceId?: string;
}

@Command({
  name: 'upgrade-0.30',
  description: 'Upgrade to 0.30',
})
export class UpgradeTo0_30Command extends CommandRunner {
  constructor(
    private readonly syncWorkspaceMetadataCommand: SyncWorkspaceMetadataCommand,
    private readonly migrateEmailFieldsToEmails: MigrateEmailFieldsToEmailsCommand,
    private readonly setCustomObjectIsSoftDeletableCommand: SetCustomObjectIsSoftDeletableCommand,
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
    options: UpdateTo0_30CommandOptions,
  ): Promise<void> {
    await this.syncWorkspaceMetadataCommand.run(passedParam, {
      ...options,
      force: true,
    });
    await this.setCustomObjectIsSoftDeletableCommand.run(passedParam, options);
    await this.migrateEmailFieldsToEmails.run(passedParam, options);
  }
}
