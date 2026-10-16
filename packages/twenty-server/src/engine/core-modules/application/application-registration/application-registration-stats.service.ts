import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type ApplicationBilling } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { type Repository, type SelectQueryBuilder } from 'typeorm';

import { ClickHouseService } from 'src/database/clickhouse/clickhouse.service';
import { ApplicationHealthCacheService } from 'src/engine/core-modules/application/application-health/application-health-cache.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { type ApplicationRegistrationStatsDTO } from 'src/engine/core-modules/application/application-registration/dtos/application-registration-stats.dto';
import { buildApplicationCreditBreakdown } from 'src/engine/core-modules/application/application-registration/utils/build-application-credit-breakdown.util';
import {
  buildApplicationInstallStats,
  type ApplicationVersionStats,
} from 'src/engine/core-modules/application/application-registration/utils/build-application-install-stats.util';
import { summarizeApplicationHealth } from 'src/engine/core-modules/application/application-registration/utils/summarize-application-health.util';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

const LOOKUP_BATCH_SIZE = 50;

type HealthApplication = Pick<
  ApplicationEntity,
  'id' | 'workspaceId' | 'version' | 'healthCheckLogicFunctionId'
> & { needsReconnection: boolean };
type CreditApplication = Pick<
  ApplicationEntity,
  'id' | 'workspaceId' | 'billing'
>;
type CreditUsageRow = Parameters<
  typeof buildApplicationCreditBreakdown
>[0]['usageRows'][number];

@Injectable()
export class ApplicationRegistrationStatsService {
  private readonly logger = new Logger(
    ApplicationRegistrationStatsService.name,
  );

  constructor(
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    private readonly applicationHealthCacheService: ApplicationHealthCacheService,
    private readonly clickHouseService: ClickHouseService,
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly applicationRegistrationRepository: Repository<ApplicationRegistrationEntity>,
  ) {}

  private getInstallations(applicationRegistrationId: string) {
    return this.applicationRepository
      .createQueryBuilder('application')
      .innerJoin('application.workspace', 'workspace')
      .where(
        'application.applicationRegistrationId = :applicationRegistrationId',
        { applicationRegistrationId },
      )
      .andWhere('workspace.deletedAt IS NULL');
  }

  private getInstallationsWithConnections(applicationRegistrationId: string) {
    return this.getInstallations(applicationRegistrationId).leftJoin(
      (query) =>
        query
          .select('connection.applicationId', 'applicationId')
          .addSelect('connection.workspaceId', 'workspaceId')
          .distinct(true)
          .from(ConnectedAccountEntity, 'connection')
          .where('connection.archivedAt IS NULL')
          .andWhere('connection.authFailedAt IS NOT NULL'),
      'failedConnection',
      '"failedConnection"."applicationId" = application.id AND "failedConnection"."workspaceId" = application.workspaceId',
    );
  }

  async computeStats(
    registration: Pick<
      ApplicationRegistrationEntity,
      'id' | 'latestAvailableVersion'
    >,
  ): Promise<ApplicationRegistrationStatsDTO> {
    const versions = await this.getInstallationsWithConnections(registration.id)
      .select("COALESCE(application.version, 'unknown')", 'version')
      .addSelect('COUNT(*)', 'count')
      .addSelect(
        'COUNT(*) FILTER (WHERE workspace.activationStatus = :suspended)',
        'suspendedInstalls',
      )
      .addSelect(
        'COUNT(*) FILTER (WHERE application.autoUpgrade)',
        'autoUpdateEnabled',
      )
      .addSelect(
        'COUNT(*) FILTER (WHERE "failedConnection"."applicationId" IS NOT NULL)',
        'needsReconnection',
      )
      .setParameter('suspended', WorkspaceActivationStatus.SUSPENDED)
      .groupBy("COALESCE(application.version, 'unknown')")
      .getRawMany<ApplicationVersionStats>();
    const { needsReconnection, ...installStats } = buildApplicationInstallStats(
      { versions, latestAvailableVersion: registration.latestAvailableVersion },
    );
    const [health, creditUsage] = await Promise.all([
      this.getHealthSummary(registration.id),
      this.getCreditBreakdown({ applicationRegistrationId: registration.id }),
    ]);
    const workspacesNeedingAttention =
      needsReconnection + health.needingAttention;

    return {
      ...installStats,
      workspacesNeedingAttention:
        installStats.activeInstalls === 0 ||
        health.known > 0 ||
        workspacesNeedingAttention > 0
          ? workspacesNeedingAttention
          : null,
      healthCheckedWorkspaces: health.checked,
      totalCreditsConsumed: creditUsage?.totalCreditsConsumed ?? null,
      creditBreakdown: creditUsage?.creditBreakdown ?? null,
    };
  }

  private async *getInstallationBatches<TData extends { id: string }>(
    query: SelectQueryBuilder<ApplicationEntity>,
  ): AsyncGenerator<TData[]> {
    let cursor: string | undefined;

    while (true) {
      const batchQuery = query
        .clone()
        .orderBy('application.id')
        .limit(LOOKUP_BATCH_SIZE);
      if (isDefined(cursor)) {
        batchQuery.andWhere('application.id > :cursor', { cursor });
      }
      const applications = await batchQuery.getRawMany<TData>();
      if (applications.length === 0) {
        return;
      }
      yield applications;
      if (applications.length < LOOKUP_BATCH_SIZE) {
        return;
      }
      cursor = applications[applications.length - 1].id;
    }
  }

  private async getHealthSummary(applicationRegistrationId: string) {
    const summaries: ReturnType<typeof summarizeApplicationHealth>[] = [];
    const query = this.getInstallationsWithConnections(
      applicationRegistrationId,
    )
      .select('application.id', 'id')
      .addSelect('application.workspaceId', 'workspaceId')
      .addSelect('application.version', 'version')
      .addSelect(
        'application.healthCheckLogicFunctionId',
        'healthCheckLogicFunctionId',
      )
      .addSelect(
        '"failedConnection"."applicationId" IS NOT NULL',
        'needsReconnection',
      )
      .andWhere('application.healthCheckLogicFunctionId IS NOT NULL');

    for await (const applications of this.getInstallationBatches<HealthApplication>(
      query,
    )) {
      const statuses =
        await this.applicationHealthCacheService.getStatuses(applications);
      summaries.push(summarizeApplicationHealth({ statuses, applications }));
    }

    return summaries.reduce(
      (total, summary) => ({
        checked: total.checked + summary.checked,
        known: total.known + summary.known,
        needingAttention: total.needingAttention + summary.needingAttention,
      }),
      { checked: 0, known: 0, needingAttention: 0 },
    );
  }

  private async getCreditBreakdown({
    applicationRegistrationId,
  }: {
    applicationRegistrationId: string;
  }) {
    if (!isDefined(this.clickHouseService.getMainClient())) {
      return null;
    }

    try {
      const registration = await this.applicationRegistrationRepository
        .createQueryBuilder('registration')
        .select(
          "registration.manifest -> 'application' -> 'billing'",
          'billing',
        )
        .where('registration.id = :applicationRegistrationId', {
          applicationRegistrationId,
        })
        .getRawOne<{ billing: ApplicationBilling | null }>();
      const billingDefinitions = new Map<string, ApplicationBilling>();
      const usageRows = new Map<string, CreditUsageRow>();

      if (isDefined(registration?.billing)) {
        billingDefinitions.set(
          JSON.stringify(registration.billing),
          registration.billing,
        );
      }

      const query = this.getInstallations(applicationRegistrationId)
        .select('application.id', 'id')
        .addSelect('application.workspaceId', 'workspaceId')
        .addSelect('application.billing', 'billing');

      for await (const applications of this.getInstallationBatches<CreditApplication>(
        query,
      )) {
        for (const { billing } of applications) {
          if (isDefined(billing)) {
            const key = JSON.stringify(billing);
            if (!billingDefinitions.has(key)) {
              billingDefinitions.set(key, billing);
            }
          }
        }

        const rows = await this.clickHouseService.selectOrThrow<CreditUsageRow>(
          `SELECT resourceType, operationType, resourceContext, sum(creditsUsedMicro) AS creditsUsedMicro
           FROM usageEvent
           WHERE workspaceId IN ({workspaceIds:Array(String)})
             AND applicationId IN ({applicationIds:Array(String)})
           GROUP BY resourceType, operationType, resourceContext`,
          {
            workspaceIds: [
              ...new Set(applications.map(({ workspaceId }) => workspaceId)),
            ],
            applicationIds: applications.map(({ id }) => id),
          },
        );

        for (const row of rows) {
          const key = JSON.stringify([
            row.resourceType,
            row.operationType,
            row.resourceContext,
          ]);
          const previous = usageRows.get(key);
          usageRows.set(key, {
            ...row,
            creditsUsedMicro: String(
              Number(previous?.creditsUsedMicro ?? 0) +
                Number(row.creditsUsedMicro),
            ),
          });
        }
      }

      return buildApplicationCreditBreakdown({
        billingDefinitions: [...billingDefinitions.values()],
        usageRows: [...usageRows.values()],
      });
    } catch (error) {
      this.logger.warn('Failed to load application credit usage', error);
      return null;
    }
  }
}
