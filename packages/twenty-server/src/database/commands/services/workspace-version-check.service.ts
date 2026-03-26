import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { SemVer } from 'semver';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { In, Repository } from 'typeorm';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { compareVersionMajorAndMinor } from 'src/utils/version/compare-version-minor-and-major';
import { getPreviousVersion } from 'src/utils/version/get-previous-version';

export const UPGRADE_COMMAND_VERSIONS = [
  '1.16.0',
  '1.17.0',
  '1.18.0',
  '1.19.0',
  '1.20.0',
] as const;

export type UpgradeCommandVersion = (typeof UPGRADE_COMMAND_VERSIONS)[number];

@Injectable()
export class WorkspaceVersionCheckService {
  private readonly logger = new Logger(WorkspaceVersionCheckService.name);

  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async hasActiveOrSuspendedWorkspaces(): Promise<boolean> {
    const workspaces = await this.loadActiveOrSuspendedWorkspaces();

    return workspaces.length > 0;
  }

  async getWorkspacesBelowVersion(
    version: string,
  ): Promise<Pick<WorkspaceEntity, 'id' | 'displayName' | 'version'>[]> {
    const allActiveOrSuspendedWorkspaces =
      await this.loadActiveOrSuspendedWorkspaces();

    if (allActiveOrSuspendedWorkspaces.length === 0) {
      this.logger.log(
        'No workspaces found. Running migrations for fresh installation.',
      );

      return [];
    }

    return allActiveOrSuspendedWorkspaces.filter((workspace) => {
      if (!isDefined(workspace.version)) {
        return true;
      }

      try {
        const versionCompareResult = compareVersionMajorAndMinor(
          workspace.version,
          version,
        );

        return versionCompareResult === 'lower';
      } catch (error) {
        this.logger.error(
          `Error checking workspace ${workspace.id} version: ${error.message}`,
        );

        return true;
      }
    });
  }

  getCurrentAppVersion(): SemVer {
    const appVersion = this.twentyConfigService.get('APP_VERSION');

    if (!isDefined(appVersion)) {
      throw new Error(
        'APP_VERSION is not defined, please double check your env variables',
      );
    }

    return new SemVer(appVersion);
  }

  getPreviousTwentyMajorMinorVersion(): SemVer {
    const currentAppVersion = this.getCurrentAppVersion();
    const currentVersionMajorMinor = `${currentAppVersion.major}.${currentAppVersion.minor}.0`;

    const previousVersion = getPreviousVersion({
      currentVersion: currentVersionMajorMinor,
      versions: [...UPGRADE_COMMAND_VERSIONS],
    });

    if (!isDefined(previousVersion)) {
      throw new Error(
        `No previous version found for version ${currentAppVersion}. Available versions: ${UPGRADE_COMMAND_VERSIONS.join(', ')}`,
      );
    }

    return previousVersion;
  }

  private async loadActiveOrSuspendedWorkspaces(): Promise<
    Pick<WorkspaceEntity, 'id' | 'version' | 'displayName'>[]
  > {
    return this.workspaceRepository.find({
      select: ['id', 'version', 'displayName'],
      where: {
        activationStatus: In([
          WorkspaceActivationStatus.ACTIVE,
          WorkspaceActivationStatus.SUSPENDED,
        ]),
      },
      order: {
        id: 'ASC',
      },
    });
  }
}
