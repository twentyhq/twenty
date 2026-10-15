import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import semver from 'semver';
import { ApplicationHealthStatus } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { type Repository } from 'typeorm';

import { ClickHouseService } from 'src/database/clickhouse/clickhouse.service';
import { ApplicationHealthCacheService } from 'src/engine/core-modules/application/application-health/application-health-cache.service';
import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { type ApplicationRegistrationStatsDTO } from 'src/engine/core-modules/application/application-registration/dtos/application-registration-stats.dto';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { toDisplayCredits } from 'src/engine/core-modules/usage/utils/to-display-credits.util';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

type ApplicationStatsRow = Pick<
  ApplicationEntity,
  | 'id'
  | 'workspaceId'
  | 'version'
  | 'autoUpgrade'
  | 'healthCheckLogicFunctionId'
  | 'deletedAt'
> & {
  activationStatus: WorkspaceActivationStatus;
  needsReconnection: boolean;
};

@Injectable()
export class ApplicationRegistrationStatsService {
  private readonly logger = new Logger(
    ApplicationRegistrationStatsService.name,
  );

  constructor(
    // Authorized registration statistics aggregate across workspaces.
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    private readonly applicationHealthCacheService: ApplicationHealthCacheService,
    private readonly clickHouseService: ClickHouseService,
  ) {}

  async computeStats(
    registration: Pick<
      ApplicationRegistrationEntity,
      'id' | 'latestAvailableVersion'
    >,
  ): Promise<ApplicationRegistrationStatsDTO> {
    const applications = await this.applicationRepository
      .createQueryBuilder('application')
      .withDeleted()
      .innerJoin('application.workspace', 'workspace')
      .select('application.id', 'id')
      .addSelect('application.workspaceId', 'workspaceId')
      .addSelect('application.version', 'version')
      .addSelect('application.autoUpgrade', 'autoUpgrade')
      .addSelect(
        'application.healthCheckLogicFunctionId',
        'healthCheckLogicFunctionId',
      )
      .addSelect('application.deletedAt', 'deletedAt')
      .addSelect('workspace.activationStatus', 'activationStatus')
      .addSelect(
        (query) =>
          query
            .select('COUNT(*) > 0')
            .from(ConnectedAccountEntity, 'connection')
            .where('connection.applicationId = application.id')
            .andWhere('connection.workspaceId = application.workspaceId')
            .andWhere('connection.archivedAt IS NULL')
            .andWhere('connection.authFailedAt IS NOT NULL'),
        'needsReconnection',
      )
      .where(
        'application.applicationRegistrationId = :applicationRegistrationId',
        {
          applicationRegistrationId: registration.id,
        },
      )
      .andWhere('workspace.deletedAt IS NULL')
      .getRawMany<ApplicationStatsRow>();

    const installedApplications = applications.filter(
      (application) => !isDefined(application.deletedAt),
    );
    const [healthStatuses, totalCreditsConsumed] = await Promise.all([
      this.applicationHealthCacheService.getStatuses(installedApplications),
      this.getTotalCreditsConsumed(applications),
    ]);
    const versionCounts = new Map<string, number>();

    for (const application of installedApplications) {
      const version = application.version ?? 'unknown';

      versionCounts.set(version, (versionCounts.get(version) ?? 0) + 1);
    }

    const versionDistribution = [...versionCounts]
      .map(([version, count]) => ({
        version,
        count,
      }))
      .sort(
        (left, right) =>
          right.count - left.count || left.version.localeCompare(right.version),
      );
    const latestVersion = isDefined(registration.latestAvailableVersion)
      ? semver.valid(registration.latestAvailableVersion)
      : null;
    const knownHealthStatuses = healthStatuses.filter(
      (status) =>
        isDefined(status) && status !== ApplicationHealthStatus.UNKNOWN,
    );
    const workspacesNeedingAttention = installedApplications.filter(
      (application, index) =>
        application.needsReconnection ||
        healthStatuses[index] === ApplicationHealthStatus.WARNING ||
        healthStatuses[index] === ApplicationHealthStatus.ERROR,
    ).length;

    return {
      activeInstalls: installedApplications.length,
      suspendedInstalls: installedApplications.filter(
        ({ activationStatus }) =>
          activationStatus === WorkspaceActivationStatus.SUSPENDED,
      ).length,
      mostInstalledVersion: versionDistribution[0]?.version ?? null,
      versionDistribution,
      onLatestVersion: isDefined(latestVersion)
        ? installedApplications.filter(
            ({ version }) =>
              isDefined(version) &&
              isDefined(semver.valid(version)) &&
              semver.eq(version, latestVersion),
          ).length
        : null,
      updatesAvailable: isDefined(latestVersion)
        ? installedApplications.filter(
            ({ version }) =>
              isDefined(version) &&
              isDefined(semver.valid(version)) &&
              semver.lt(version, latestVersion),
          ).length
        : null,
      autoUpdateEnabled: installedApplications.filter(
        ({ autoUpgrade }) => autoUpgrade,
      ).length,
      workspacesNeedingAttention:
        installedApplications.length === 0 ||
        knownHealthStatuses.length > 0 ||
        workspacesNeedingAttention > 0
          ? workspacesNeedingAttention
          : null,
      healthCheckedWorkspaces: knownHealthStatuses.length,
      totalCreditsConsumed,
    };
  }

  private async getTotalCreditsConsumed(
    applications: Pick<ApplicationStatsRow, 'id' | 'workspaceId'>[],
  ): Promise<number | null> {
    if (!isDefined(this.clickHouseService.getMainClient())) {
      return null;
    }

    if (applications.length === 0) {
      return 0;
    }

    try {
      const rows = await this.clickHouseService.selectOrThrow<{
        creditsUsedMicro: string;
      }>(
        `SELECT sum(creditsUsedMicro) AS creditsUsedMicro
         FROM usageEvent
         WHERE workspaceId IN ({workspaceIds:Array(String)})
           AND applicationId IN ({applicationIds:Array(String)})`,
        {
          workspaceIds: [
            ...new Set(applications.map(({ workspaceId }) => workspaceId)),
          ],
          applicationIds: applications.map(({ id }) => id),
        },
      );

      return isDefined(rows[0])
        ? toDisplayCredits(Number(rows[0].creditsUsedMicro))
        : null;
    } catch (error) {
      this.logger.warn('Failed to load application credit usage', error);

      return null;
    }
  }
}
