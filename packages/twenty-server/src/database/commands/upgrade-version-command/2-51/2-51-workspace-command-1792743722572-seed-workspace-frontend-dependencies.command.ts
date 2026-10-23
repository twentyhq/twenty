import { Command } from 'nest-commander';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { text } from 'stream/consumers';
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

@RegisteredWorkspaceCommand('2.51.0', 1792743722572)
@Command({
  name: 'upgrade:2-51:seed-workspace-frontend-dependencies',
  description:
    'Add locked frontend dependencies to unchanged Workspace app defaults',
})
export class SeedWorkspaceFrontendDependenciesCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly fileStorageService: FileStorageService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }
  async up(args: RunOnWorkspaceArgs): Promise<void> {
    await this.replaceDefaults({ ...args, direction: 'up' });
  }
  async down(args: RunOnWorkspaceArgs): Promise<void> {
    await this.replaceDefaults({ ...args, direction: 'down' });
  }

  private async replaceDefaults({
    workspaceId,
    options,
    direction,
  }: Pick<RunOnWorkspaceArgs, 'workspaceId' | 'options'> & {
    direction: 'up' | 'down';
  }): Promise<void> {
    const { workspaceCustomFlatApplication: application } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );
    const [before, after] = await Promise.all(
      ['before', 'after'].map(async (state) => {
        const directory = join(
          ASSET_PATH,
          'database/commands/upgrade-version-command/2-51/workspace-frontend-dependencies',
          state,
        );
        const [packageJson, yarnLock] = await Promise.all(
          ['package.snapshot.json', 'yarn.snapshot.lock'].map((name) =>
            readFile(join(directory, name), 'utf8'),
          ),
        );
        return {
          packageJson,
          yarnLock,
          packageJsonChecksum: logicFunctionCreateHash(
            JSON.stringify(JSON.parse(packageJson)),
          ),
          yarnLockChecksum: logicFunctionCreateHash(yarnLock),
        };
      }),
    );
    const previous = direction === 'up' ? before : after;
    const next = direction === 'up' ? after : before;
    if (
      application.packageJsonChecksum !== previous.packageJsonChecksum ||
      application.yarnLockChecksum !== previous.yarnLockChecksum
    ) {
      return;
    }
    if (options.dryRun) {
      this.logger.log(
        `Workspace ${workspaceId}: would update unchanged app dependency defaults`,
      );
      return;
    }
    const resource = {
      workspaceId,
      applicationId: application.id,
      applicationUniversalIdentifier: application.universalIdentifier,
      fileFolder: FileFolder.Dependencies,
    };
    for (const [resourcePath, previousContents, nextContents] of [
      ['package.json', previous.packageJson, next.packageJson],
      ['yarn.lock', previous.yarnLock, next.yarnLock],
    ]) {
      const stored = await text(
        await this.fileStorageService.readFile({ ...resource, resourcePath }),
      );
      // Accept target bytes when retrying an interrupted file upload.
      if (stored !== previousContents && stored !== nextContents) {
        throw new Error(
          `Workspace ${workspaceId}: app dependency files changed during upgrade`,
        );
      }
    }
    const packageFile = await this.fileStorageService.writeFile({
      ...resource,
      resourcePath: 'package.json',
      sourceFile: next.packageJson,
      settings: { isTemporaryFile: false, toDelete: false },
    });
    const lockFile = await this.fileStorageService.writeFile({
      ...resource,
      resourcePath: 'yarn.lock',
      sourceFile: next.yarnLock,
      settings: { isTemporaryFile: false, toDelete: false },
    });
    await this.applicationService.update(application.id, {
      workspaceId,
      packageJsonFileId: packageFile.id,
      yarnLockFileId: lockFile.id,
      packageJsonChecksum: next.packageJsonChecksum,
      yarnLockChecksum: next.yarnLockChecksum,
      availablePackages: parseAvailablePackagesFromPackageJsonAndYarnLock(
        next.packageJson,
        next.yarnLock,
      ),
    });
  }
}
