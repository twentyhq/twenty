import { Command } from 'nest-commander';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { FileFolder } from 'twenty-shared/types';
import { ASSET_PATH } from 'src/constants/assets-path';
import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { parseAvailablePackagesFromPackageJsonAndYarnLock } from 'src/engine/core-modules/application/application-package/utils/parse-available-packages-from-package-json-and-yarn-lock.util';
import { logicFunctionCreateHash } from 'src/engine/metadata-modules/logic-function/utils/logic-function-create-hash.utils';

@RegisteredWorkspaceCommand('2.52.0', 1792761562238)
@Command({
  name: 'upgrade:2-52:seed-workspace-frontend-dependencies',
  description:
    'Replace Workspace app dependencies with frontend-ready defaults',
})
export class SeedWorkspaceFrontendDependenciesCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly fileStorageService: FileStorageService,
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
    const [packageJson, yarnLock] = await Promise.all([
      readFile(join(directory, 'package.snapshot.json'), 'utf8'),
      readFile(join(directory, 'yarn.snapshot.lock'), 'utf8'),
    ]);

    const resource = {
      workspaceId,
      applicationId: application.id,
      applicationUniversalIdentifier: application.universalIdentifier,
      fileFolder: FileFolder.Dependencies,
    };
    const packageJsonFile = await this.fileStorageService.writeFile({
      ...resource,
      resourcePath: 'package.json',
      sourceFile: packageJson,
      settings: { isTemporaryFile: false, toDelete: false },
    });
    const yarnLockFile = await this.fileStorageService.writeFile({
      ...resource,
      resourcePath: 'yarn.lock',
      sourceFile: yarnLock,
      settings: { isTemporaryFile: false, toDelete: false },
    });

    await this.applicationService.update(application.id, {
      workspaceId,
      packageJsonFileId: packageJsonFile.id,
      yarnLockFileId: yarnLockFile.id,
      packageJsonChecksum: logicFunctionCreateHash(
        JSON.stringify(JSON.parse(packageJson)),
      ),
      yarnLockChecksum: logicFunctionCreateHash(yarnLock),
      availablePackages: parseAvailablePackagesFromPackageJsonAndYarnLock(
        packageJson,
        yarnLock,
      ),
    });
  }
}
