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

  async getWorkspacesBelowMinimumVersion(
    allCommandVersions: string[],
  ): Promise<Pick<WorkspaceEntity, 'id' | 'displayName' | 'version'>[]> {
    const currentAppVersion = this.getCurrentAppVersion();
    const currentVersionMajorMinor = `${currentAppVersion.major}.${currentAppVersion.minor}.0`;

    const previousVersion = getPreviousVersion({
      currentVersion: currentVersionMajorMinor,
      versions: allCommandVersions,
    });

    if (!isDefined(previousVersion)) {
      throw new Error(
        `No previous version found for version ${currentAppVersion}. Available versions are: ${allCommandVersions.join(', ')}`,
      );
    }

    return this.findWorkspacesBelowVersion(previousVersion);
  }

  getCurrentAppVersion(): SemVer {
    const appVersion = this.twentyConfigService.get('APP_VERSION');

    if (!isDefined(appVersion)) {
      throw new Error(
        'APP_VERSION is not defined, please double check your env variables',
      );
    }

    try {
      return new SemVer(appVersion);
    } catch {
      throw new Error(
        `Should never occur, APP_VERSION is invalid ${appVersion}`,
      );
    }
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

  private async findWorkspacesBelowVersion(
    fromWorkspaceVersion: SemVer,
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
          fromWorkspaceVersion.version,
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
}
