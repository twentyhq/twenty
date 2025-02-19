import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import { ActiveWorkspacesCommandRunner } from 'src/database/commands/active-workspaces.command';
import { BaseCommandOptions } from 'src/database/commands/base.command';
import { AddContextToActorCompositeTypeCommand } from 'src/database/commands/upgrade-version/0-41/0-41-add-context-to-actor-composite-type';
import { RemoveDuplicateMcmasCommand } from 'src/database/commands/upgrade-version/0-41/0-41-remove-duplicate-mcmas';
import { SeedWorkflowViewsCommand } from 'src/database/commands/upgrade-version/0-41/0-41-seed-workflow-views.command';
import { MigrateRelationsToFieldMetadataCommand } from 'src/database/commands/upgrade-version/0-42/0-42-migrate-relations-to-field-metadata.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { SyncWorkspaceMetadataCommand } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/sync-workspace-metadata.command';

@Command({
  name: 'upgrade-0.41',
  description: 'Upgrade to 0.41',
})
export class UpgradeTo0_41Command extends ActiveWorkspacesCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    private readonly seedWorkflowViewsCommand: SeedWorkflowViewsCommand,
    private readonly syncWorkspaceMetadataCommand: SyncWorkspaceMetadataCommand,
    private readonly migrateRelationsToFieldMetadata: MigrateRelationsToFieldMetadataCommand,
    private readonly addContextToActorCompositeType: AddContextToActorCompositeTypeCommand,
    private readonly removeDuplicateMcmasCommand: RemoveDuplicateMcmasCommand,
  ) {
    super(workspaceRepository);
  }

  async executeActiveWorkspacesCommand(
    passedParam: string[],
    options: BaseCommandOptions,
    workspaceIds: string[],
  ): Promise<void> {
    this.logger.log('Running command to upgrade to 0.41');

    await this.removeDuplicateMcmasCommand.executeActiveWorkspacesCommand(
      passedParam,
      options,
      workspaceIds,
    );

    await this.addContextToActorCompositeType.executeActiveWorkspacesCommand(
      passedParam,
      options,
      workspaceIds,
    );

    await this.syncWorkspaceMetadataCommand.executeActiveWorkspacesCommand(
      passedParam,
      {
        ...options,
        force: true,
      },
      workspaceIds,
    );

    await this.seedWorkflowViewsCommand.executeActiveWorkspacesCommand(
      passedParam,
      options,
      workspaceIds,
    );

    await this.migrateRelationsToFieldMetadata.executeActiveWorkspacesCommand(
      passedParam,
      options,
      workspaceIds,
    );
  }
}
