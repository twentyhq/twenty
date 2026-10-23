import { Command } from 'nest-commander';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { ASSET_PATH } from 'src/constants/assets-path';
import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';

@RegisteredWorkspaceCommand('2.52.0', 1792766943126)
@Command({
  name: 'upgrade:2-52:seed-workspace-frontend-dependencies',
  description:
    'Replace Workspace app dependencies with frontend-ready defaults',
})
export class SeedWorkspaceFrontendDependenciesCommand extends ProvisionedWorkspaceCommandRunner {
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
    if (options.dryRun) {
      this.logger.log(
        `Workspace ${workspaceId}: would replace app dependency files`,
      );

      return;
    }

    const { workspaceCustomFlatApplication: application } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );
    const directory = join(
      ASSET_PATH,
      'database/commands/upgrade-version-command/2-52/workspace-frontend-dependencies',
    );
    const [packageJsonContent, yarnLockContent] = await Promise.all([
      readFile(join(directory, 'package.snapshot.json'), 'utf8'),
      readFile(join(directory, 'yarn.snapshot.lock'), 'utf8'),
    ]);

    await this.applicationService.uploadPackageFilesAndSetFileIds({
      application: { ...application, workspaceId },
      packageJsonContent,
      yarnLockContent,
    });
  }
}
