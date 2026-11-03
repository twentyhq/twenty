import { Command } from 'nest-commander';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { computeRepairedDependencyChecksums } from 'src/database/commands/upgrade-version-command/2-56/utils/compute-repaired-dependency-checksums.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

@RegisteredWorkspaceCommand('2.56.0', 1793720039867)
@Command({
  name: 'upgrade:2-56:repair-application-dependency-checksums',
  description:
    'Recompute application dependency checksums that do not match the stored package.json and yarn.lock',
})
export class RepairApplicationDependencyChecksumsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly applicationService: ApplicationService,
    private readonly fileStorageService: FileStorageService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const { flatApplicationMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatApplicationMaps',
      ]);

    const flatApplications = Object.values(flatApplicationMaps.byId).filter(
      (flatApplication): flatApplication is FlatApplication =>
        isDefined(flatApplication) && !isDefined(flatApplication.deletedAt),
    );

    for (const flatApplication of flatApplications) {
      const storedDependencyContents = await this.readStoredDependencyContents({
        workspaceId,
        applicationUniversalIdentifier: flatApplication.universalIdentifier,
      });

      if (!isDefined(storedDependencyContents)) {
        continue;
      }

      const repairedChecksums = computeRepairedDependencyChecksums({
        declaredChecksums: flatApplication,
        ...storedDependencyContents,
      });

      if (!isDefined(repairedChecksums)) {
        continue;
      }

      this.logger.log(
        `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: application ${flatApplication.universalIdentifier} package.json checksum ${flatApplication.packageJsonChecksum} -> ${repairedChecksums.packageJsonChecksum}, yarn.lock checksum ${flatApplication.yarnLockChecksum} -> ${repairedChecksums.yarnLockChecksum}`,
      );

      if (options.dryRun) {
        continue;
      }

      await this.applicationService.update(flatApplication.id, {
        workspaceId,
        ...repairedChecksums,
      });
    }
  }

  private async readStoredDependencyContents({
    workspaceId,
    applicationUniversalIdentifier,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
  }): Promise<
    { packageJsonContent: string; yarnLockContent: string | null } | undefined
  > {
    const [packageJsonContent, yarnLockContent] = await Promise.all(
      ['package.json', 'yarn.lock'].map(async (resourcePath) => {
        const location = {
          workspaceId,
          applicationUniversalIdentifier,
          fileFolder: FileFolder.Dependencies,
          resourcePath,
        };

        if (!(await this.fileStorageService.checkFileExists(location))) {
          return null;
        }

        return (
          await streamToBuffer(await this.fileStorageService.readFile(location))
        ).toString('utf-8');
      }),
    );

    if (!isDefined(packageJsonContent)) {
      return undefined;
    }

    return { packageJsonContent, yarnLockContent };
  }
}
