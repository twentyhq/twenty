import { PROVISIONED_WORKSPACE_ACTIVATION_STATUSES } from 'twenty-shared/workspace';

import {
  WorkspaceCommandRunner,
  type WorkspaceCommandOptions,
} from 'src/database/commands/command-runners/workspace.command-runner';
import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';

export type ProvisionedWorkspaceCommandOptions = WorkspaceCommandOptions;

export abstract class ProvisionedWorkspaceCommandRunner<
  Options extends ProvisionedWorkspaceCommandOptions =
    ProvisionedWorkspaceCommandOptions,
> extends WorkspaceCommandRunner<Options> {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
  ) {
    super(workspaceIteratorService, PROVISIONED_WORKSPACE_ACTIVATION_STATUSES);
  }
}
