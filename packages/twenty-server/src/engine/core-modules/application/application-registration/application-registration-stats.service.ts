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
import {
  type ApplicationRegistrationCreditBreakdownDTO,
  type ApplicationRegistrationStatsDTO,
} from 'src/engine/core-modules/application/application-registration/dtos/application-registration-stats.dto';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
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
    const [healthStatuses, creditBreakdown] = await Promise.all([
      this.applicationHealthCacheService.getStatuses(installedApplications),
      this.getCreditBreakdown(applications),
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
      totalCreditsConsumed: isDefined(creditBreakdown)
        ? Object.values(creditBreakdown).reduce(
            (total, credits) => total + credits,
            0,
          )
        : null,
      creditBreakdown,
    };
  }

  private async getCreditBreakdown(
    applications: Pick<ApplicationStatsRow, 'id' | 'workspaceId'>[],
  ): Promise<ApplicationRegistrationCreditBreakdownDTO | null> {
    if (!isDefined(this.clickHouseService.getMainClient())) {
      return null;
    }

    const breakdown: ApplicationRegistrationCreditBreakdownDTO = {
      agent: 0,
      logic: 0,
      workflow: 0,
      chargeCredits: 0,
      other: 0,
    };

    if (applications.length === 0) {
      return breakdown;
    }

    try {
      const rows = await this.clickHouseService.selectOrThrow<{
        resourceType: string;
        operationType: string;
        creditsUsedMicro: string;
      }>(
        `SELECT resourceType, operationType, sum(creditsUsedMicro) AS creditsUsedMicro
         FROM usageEvent
         WHERE workspaceId IN ({workspaceIds:Array(String)})
           AND applicationId IN ({applicationIds:Array(String)})
         GROUP BY resourceType, operationType`,
        {
          workspaceIds: [
            ...new Set(applications.map(({ workspaceId }) => workspaceId)),
          ],
          applicationIds: applications.map(({ id }) => id),
        },
      );

      for (const { resourceType, operationType, creditsUsedMicro } of rows) {
        const credits = toDisplayCredits(Number(creditsUsedMicro));

        if (resourceType === UsageResourceType.APP) {
          if (operationType === UsageOperationType.SUBSCRIPTION) {
            breakdown.other += credits;
          } else {
            breakdown.chargeCredits += credits;
          }
        } else if (resourceType === UsageResourceType.LOGIC_FUNCTION) {
          breakdown.logic += credits;
        } else if (
          resourceType === UsageResourceType.WORKFLOW ||
          (resourceType === UsageResourceType.AI &&
            operationType === UsageOperationType.AI_WORKFLOW_TOKEN)
        ) {
          breakdown.workflow += credits;
        } else if (resourceType === UsageResourceType.AI) {
          breakdown.agent += credits;
        } else {
          breakdown.other += credits;
        }
      }

      return breakdown;
    } catch (error) {
      this.logger.warn('Failed to load application credit usage', error);

      return null;
    }
  }
}
