import { Command } from 'nest-commander';

import {
  ActiveOrSuspendedWorkspaceCommandRunner,
  type ActiveOrSuspendedWorkspaceCommandOptions,
} from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';

@Command({
  name: 'application:rebuild-default-package-files',
  description:
    'Re-upload default package.json and yarn.lock to file storage for all applications in the workspace',
})
export class RebuildDefaultPackageFilesCommand extends ActiveOrSuspendedWorkspaceCommandRunner<ActiveOrSuspendedWorkspaceCommandOptions> {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const applications =
      await this.applicationService.findManyApplications(workspaceId);

    this.logger.log(
      `Found ${applications.length} application(s) in workspace ${workspaceId}`,
    );

    for (const application of applications) {
      if (options.dryRun) {
        this.logger.log(
          `[DRY RUN] Would rebuild default package files for application "${application.name}" (${application.id})`,
        );
        continue;
      }

      try {
        await this.applicationService.uploadDefaultPackageFilesAndSetFileIds(
          application,
        );
        this.logger.log(
          `Rebuilt default package files for application "${application.name}" (${application.id})`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to rebuild package files for application "${application.name}" (${application.id}): ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }
}
