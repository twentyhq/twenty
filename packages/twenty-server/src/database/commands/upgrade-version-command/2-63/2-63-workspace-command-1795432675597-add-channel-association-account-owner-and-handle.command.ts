import { Command } from 'nest-commander';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';

@RegisteredWorkspaceCommand('2.63.0', 1795432675597)
@Command({
  name: 'upgrade:2-63:add-channel-association-account-owner-and-handle',
  description:
    'No longer adds the account owner and handle to channel associations: 2.64 removes both fields',
})
export class AddChannelAssociationAccountOwnerAndHandleCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(protected readonly workspaceIteratorService: WorkspaceIteratorService) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Skipping account owner and handle creation for workspace ${workspaceId}: both fields are removed in 2.64`,
    );
  }
}
