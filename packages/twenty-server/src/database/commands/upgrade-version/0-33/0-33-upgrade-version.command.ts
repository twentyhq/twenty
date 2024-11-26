import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import { ActiveWorkspacesCommandRunner } from 'src/database/commands/active-workspaces.command';
import { DeleteViewFieldsWithoutViewsCommand } from 'src/database/commands/upgrade-version/0-33/0-33-delete-view-fields-without-views.command';
import { EnforceUniqueConstraintsCommand } from 'src/database/commands/upgrade-version/0-33/0-33-enforce-unique-constraints.command';
import { SetMissingLabelIdentifierToCustomObjectsCommand } from 'src/database/commands/upgrade-version/0-33/0-33-set-missing-label-identifier-to-custom-objects.command';
import { UpdateRichTextSearchVectorCommand } from 'src/database/commands/upgrade-version/0-33/0-33-update-rich-text-search-vector-expression';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { SyncWorkspaceMetadataCommand } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/sync-workspace-metadata.command';

interface UpdateTo0_33CommandOptions {
  workspaceId?: string;
}

@Command({
  name: 'upgrade-0.33',
  description: 'Upgrade to 0.33',
})
export class UpgradeTo0_33Command extends ActiveWorkspacesCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    private readonly updateRichTextSearchVectorCommand: UpdateRichTextSearchVectorCommand,
    private readonly enforceUniqueConstraintsCommand: EnforceUniqueConstraintsCommand,
    private readonly deleteViewFieldsWithoutViewsCommand: DeleteViewFieldsWithoutViewsCommand,
    private readonly syncWorkspaceMetadataCommand: SyncWorkspaceMetadataCommand,
    private readonly setMissingLabelIdentifierToCustomObjectsCommand: SetMissingLabelIdentifierToCustomObjectsCommand,
  ) {
    super(workspaceRepository);
  }

  async executeActiveWorkspacesCommand(
    passedParam: string[],
    options: UpdateTo0_33CommandOptions,
    workspaceIds: string[],
  ): Promise<void> {
    await this.deleteViewFieldsWithoutViewsCommand.executeActiveWorkspacesCommand(
      passedParam,
      options,
      workspaceIds,
    );
    await this.enforceUniqueConstraintsCommand.executeActiveWorkspacesCommand(
      passedParam,
      {
        ...options,
        company: true,
        person: true,
        viewField: true,
        viewSort: true,
      },
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
    await this.updateRichTextSearchVectorCommand.executeActiveWorkspacesCommand(
      passedParam,
      options,
      workspaceIds,
    );
    await this.setMissingLabelIdentifierToCustomObjectsCommand.executeActiveWorkspacesCommand(
      passedParam,
      options,
      workspaceIds,
    );
  }
}
