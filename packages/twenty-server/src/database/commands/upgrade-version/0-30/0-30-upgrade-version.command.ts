import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import { ActiveWorkspacesCommandRunner } from 'src/database/commands/active-workspaces.command';
import { MigrateEmailFieldsToEmailsCommand } from 'src/database/commands/upgrade-version/0-30/0-30-migrate-email-fields-to-emails.command';
import { SetCustomObjectIsSoftDeletableCommand } from 'src/database/commands/upgrade-version/0-30/0-30-set-custom-object-is-soft-deletable.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { SyncWorkspaceMetadataCommand } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/sync-workspace-metadata.command';

interface UpdateTo0_30CommandOptions {
  workspaceId?: string;
}

@Command({
  name: 'upgrade-0.30',
  description: 'Upgrade to 0.30',
})
export class UpgradeTo0_30Command extends ActiveWorkspacesCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    private readonly syncWorkspaceMetadataCommand: SyncWorkspaceMetadataCommand,
    private readonly migrateEmailFieldsToEmails: MigrateEmailFieldsToEmailsCommand,
    private readonly setCustomObjectIsSoftDeletableCommand: SetCustomObjectIsSoftDeletableCommand,
  ) {
    super(workspaceRepository);
  }

  async executeActiveWorkspacesCommand(
    passedParam: string[],
    options: UpdateTo0_30CommandOptions,
    workspaceIds: string[],
  ): Promise<void> {
    await this.syncWorkspaceMetadataCommand.executeActiveWorkspacesCommand(
      passedParam,
      {
        ...options,
        force: true,
      },
      workspaceIds,
    );
    await this.setCustomObjectIsSoftDeletableCommand.executeActiveWorkspacesCommand(
      passedParam,
      options,
      workspaceIds,
    );
    await this.migrateEmailFieldsToEmails.executeActiveWorkspacesCommand(
      passedParam,
      options,
      workspaceIds,
    );
  }
}
