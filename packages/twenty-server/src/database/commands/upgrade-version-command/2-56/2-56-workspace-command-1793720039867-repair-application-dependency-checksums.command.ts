import { Command } from 'nest-commander';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { computeRepairedDependencyChecksums } from 'src/database/commands/upgrade-version-command/2-56/utils/compute-repaired-dependency-checksums.util';
import { ApplicationDependencyFilesService } from 'src/engine/core-modules/application/application-package/application-dependency-files.service';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

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
    private readonly applicationDependencyFilesService: ApplicationDependencyFilesService,
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
      try {
        await this.repairApplicationDependencyChecksums({
          workspaceId,
          flatApplication,
          isDryRun: options.dryRun ?? false,
        });
      } catch (error) {
        this.logger.error(
          `Workspace ${workspaceId}: failed to repair dependency checksums of application ${flatApplication.universalIdentifier}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }
  }

  private async repairApplicationDependencyChecksums({
    workspaceId,
    flatApplication,
    isDryRun,
  }: {
    workspaceId: string;
    flatApplication: FlatApplication;
    isDryRun: boolean;
  }): Promise<void> {
    const applicationIdentifier = {
      workspaceId,
      applicationUniversalIdentifier: flatApplication.universalIdentifier,
    };

    const isPackageJsonStored = await this.fileStorageService.checkFileExists({
      ...applicationIdentifier,
      fileFolder: FileFolder.Dependencies,
      resourcePath: 'package.json',
    });

    if (!isPackageJsonStored) {
      return;
    }

    const { packageJsonContent, yarnLockContent } =
      await this.applicationDependencyFilesService.getDependencyContents(
        applicationIdentifier,
      );

    const repairedChecksums = computeRepairedDependencyChecksums({
      declaredChecksums: flatApplication,
      packageJsonContent,
      yarnLockContent,
    });

    if (!isDefined(repairedChecksums)) {
      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: application ${flatApplication.universalIdentifier} package.json checksum ${flatApplication.packageJsonChecksum} -> ${repairedChecksums.packageJsonChecksum}, yarn.lock checksum ${flatApplication.yarnLockChecksum} -> ${repairedChecksums.yarnLockChecksum}`,
    );

    if (isDryRun) {
      return;
    }

    await this.applicationService.update(flatApplication.id, {
      workspaceId,
      ...repairedChecksums,
    });
  }
}
