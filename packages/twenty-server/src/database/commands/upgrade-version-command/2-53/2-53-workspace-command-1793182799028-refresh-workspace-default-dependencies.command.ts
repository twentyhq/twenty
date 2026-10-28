import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationDependencyFilesService } from 'src/engine/core-modules/application/application-package/application-dependency-files.service';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';

const DEPENDENCY_CHECKSUMS_SEEDED_IN_2_52 = [
  {
    packageJsonChecksum: '7d84e53bcbc345d9652b048470f59695',
    yarnLockChecksum: '6a09947c24d8cba9011da22936fe3e87',
  },
  {
    packageJsonChecksum: '444fb064df1febd5f30c8bcadf58e536',
    yarnLockChecksum: '225201a4fd2b60ab92c865fce0fd18d6',
  },
];

@RegisteredWorkspaceCommand('2.53.0', 1793182799028)
@Command({
  name: 'upgrade:2-53:refresh-workspace-default-dependencies',
  description:
    'Move Workspace apps still on the dependencies seeded in 2.52 to the default dependencies',
})
export class RefreshWorkspaceDefaultDependenciesCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly applicationDependencyFilesService: ApplicationDependencyFilesService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const { workspaceCustomFlatApplication: application } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const storedChecksums = await this.applicationDependencyFilesService
      .getDependencyContents({
        workspaceId,
        applicationUniversalIdentifier: application.universalIdentifier,
      })
      .then(({ storedFilesChecksums }) => storedFilesChecksums)
      .catch((error: unknown) => {
        this.logger.warn(
          `Skipping the dependencies of the Workspace app of workspace ${workspaceId}: ${error instanceof Error ? error.message : String(error)}`,
        );

        return undefined;
      });

    const isOnSeededDependencies =
      isDefined(storedChecksums) &&
      DEPENDENCY_CHECKSUMS_SEEDED_IN_2_52.some(
        ({ packageJsonChecksum, yarnLockChecksum }) =>
          storedChecksums.packageJsonChecksum === packageJsonChecksum &&
          storedChecksums.yarnLockChecksum === yarnLockChecksum,
      );

    if (!isOnSeededDependencies) {
      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Would move the Workspace app of workspace ${workspaceId} to the default dependencies`,
      );

      return;
    }

    await this.applicationService.uploadDefaultPackageFilesAndSetFileIds({
      ...application,
      workspaceId,
    });
  }
}
