import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import {
  WorkspaceCommandRunner,
  type WorkspaceCommandOptions,
} from 'src/database/commands/command-runners/workspace.command-runner';
import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';

export type ActiveOrSuspendedWorkspaceCommandOptions = WorkspaceCommandOptions;

export abstract class ActiveOrSuspendedWorkspaceCommandRunner<
  Options extends
    ActiveOrSuspendedWorkspaceCommandOptions = ActiveOrSuspendedWorkspaceCommandOptions,
> extends WorkspaceCommandRunner<Options> {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
  ) {
    super(workspaceIteratorService, [
      WorkspaceActivationStatus.ACTIVE,
      WorkspaceActivationStatus.SUSPENDED,
    ]);
  }
}
