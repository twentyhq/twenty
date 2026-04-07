import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { SemVer } from 'semver';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { type WorkspaceIteratorContext } from 'src/database/commands/command-runners/workspace-iterator.service';
import {
  type UpgradeCommandOptions,
  type VersionCommands,
} from 'src/database/commands/command-runners/upgrade.command-runner';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  type CompareVersionMajorAndMinorReturnType,
  compareVersionMajorAndMinor,
} from 'src/utils/version/compare-version-minor-and-major';

export type UpgradeWorkspaceArgs = {
  iteratorContext: WorkspaceIteratorContext;
  options: UpgradeCommandOptions;
  fromWorkspaceVersion: SemVer;
  currentAppVersion: SemVer;
  workspaceCommands: VersionCommands;
};

@Injectable()
export class WorkspaceUpgradeService {
  private readonly logger = new Logger(WorkspaceUpgradeService.name);

  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  async upgradeWorkspace({
    iteratorContext,
    options,
    fromWorkspaceVersion,
    currentAppVersion,
    workspaceCommands,
  }: UpgradeWorkspaceArgs): Promise<void> {
    const { workspaceId, index, total } = iteratorContext;

    this.logger.log(
      `${options.dryRun ? '(dry run) ' : ''}Upgrading workspace ${workspaceId} from=${fromWorkspaceVersion} to=${currentAppVersion} ${index + 1}/${total}`,
    );

    const versionCompareResult =
      await this.compareWorkspaceVersionToFromVersion(
        workspaceId,
        fromWorkspaceVersion,
      );

    switch (versionCompareResult) {
      case 'lower': {
        throw new Error(
          `WORKSPACE_VERSION_MISMATCH Upgrade for workspace ${workspaceId} failed as its version is beneath fromWorkspaceVersion=${fromWorkspaceVersion.version}`,
        );
      }
      case 'equal': {
        for (const workspaceCommand of workspaceCommands) {
          await workspaceCommand.runOnWorkspace({
            options: options as RunOnWorkspaceArgs['options'],
            workspaceId,
            dataSource: iteratorContext.dataSource,
            index,
            total,
          });
        }

        if (!options.dryRun) {
          await this.workspaceRepository.update(
            { id: workspaceId },
            { version: currentAppVersion.version },
          );
        }

        this.logger.log(`Upgrade for workspace ${workspaceId} completed.`);

        return;
      }
      case 'higher': {
        this.logger.log(
          `Upgrade for workspace ${workspaceId} ignored as is already at a higher version.`,
        );

        return;
      }
      default: {
        assertUnreachable(versionCompareResult);
      }
    }
  }

  private async compareWorkspaceVersionToFromVersion(
    workspaceId: string,
    fromWorkspaceVersion: SemVer,
  ): Promise<CompareVersionMajorAndMinorReturnType> {
    const workspace = await this.workspaceRepository.findOneByOrFail({
      id: workspaceId,
    });
    const currentWorkspaceVersion = workspace.version;

    if (!isDefined(currentWorkspaceVersion)) {
      throw new Error(`WORKSPACE_VERSION_NOT_DEFINED workspace=${workspaceId}`);
    }

    return compareVersionMajorAndMinor(
      currentWorkspaceVersion,
      fromWorkspaceVersion.version,
    );
  }
}
