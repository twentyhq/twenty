import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type ApplicationBilling } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { type Repository } from 'typeorm';

import { ClickHouseService } from 'src/database/clickhouse/clickhouse.service';
import { ApplicationHealthCacheService } from 'src/engine/core-modules/application/application-health/application-health-cache.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { type ApplicationRegistrationStatsDTO } from 'src/engine/core-modules/application/application-registration/dtos/application-registration-stats.dto';
import { type ApplicationRegistrationStatsInput } from 'src/engine/core-modules/application/application-registration/types/application-registration-stats-input.type';
import { buildApplicationCreditBreakdown } from 'src/engine/core-modules/application/application-registration/utils/build-application-credit-breakdown.util';
import {
  buildApplicationInstallStats,
  type ApplicationVersionStats,
} from 'src/engine/core-modules/application/application-registration/utils/build-application-install-stats.util';
import { summarizeApplicationHealth } from 'src/engine/core-modules/application/application-registration/utils/summarize-application-health.util';
import { ApplicationRegistrationInstallationService } from 'src/engine/core-modules/application/application-registration/application-registration-installation.service';
import { toClickHouseUuidTuple } from 'src/engine/core-modules/application/application-registration/utils/to-clickhouse-uuid-tuple.util';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';

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
    private readonly installationService: ApplicationRegistrationInstallationService,
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

  async computeStats(registration: ApplicationRegistrationStatsInput): Promise<{
    stats: ApplicationRegistrationStatsDTO;
    healthReadFailed: boolean;
  }> {
    const versions = await this.getInstallations(registration.id)
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
        `COUNT(*) FILTER (WHERE EXISTS (
          SELECT 1 FROM core."connectedAccount" connection
          WHERE connection."applicationId" = application.id
            AND connection."workspaceId" = application."workspaceId"
            AND connection."archivedAt" IS NULL
            AND connection."authFailedAt" IS NOT NULL
        ))`,
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
      needsReconnection + (health?.needingAttention ?? 0);

    return {
      stats: {
        ...installStats,
        workspacesNeedingAttention:
          installStats.activeInstalls === 0 ||
          (health?.known ?? 0) > 0 ||
          workspacesNeedingAttention > 0
            ? workspacesNeedingAttention
            : null,
        healthCheckedWorkspaces: health?.checked ?? 0,
        totalCreditsConsumed: creditUsage?.totalCreditsConsumed ?? null,
        creditBreakdown: creditUsage?.creditBreakdown ?? null,
      },
      healthReadFailed: health === null,
    };
  }

  private async getHealthSummary(applicationRegistrationId: string) {
    const summaries: ReturnType<typeof summarizeApplicationHealth>[] = [];
    let healthReadFailed = false;

    await this.installationService.forEachBatch({
      applicationRegistrationId,
      mode: 'health',
      processBatch: async (applications) => {
        const statuses = await this.applicationHealthCacheService
          .getStatuses({ applications })
          .catch(() => {
            healthReadFailed = true;
            return null;
          });

        if (statuses === null) {
          return;
        }

        const reconnectionIdentities =
          await this.installationService.getReconnectionIdentities(
            applications,
          );

        summaries.push(
          summarizeApplicationHealth({
            statuses,
            applications: applications.map(({ id, workspaceId }) => ({
              needsReconnection: reconnectionIdentities.has(
                `${workspaceId}:${id}`,
              ),
            })),
          }),
        );
      },
    });

    if (healthReadFailed) {
      return null;
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
      const registration = await this.applicationRegistrationRepository.findOne(
        {
          where: { id: applicationRegistrationId },
          select: { manifest: true },
        },
      );
      const billingDefinitions = new Map<string, ApplicationBilling>();
      const applicationIds: string[] = [];
      const workspaceIds = new Set<string>();

      if (isDefined(registration?.manifest?.application?.billing)) {
        billingDefinitions.set(
          JSON.stringify(registration.manifest.application.billing),
          registration.manifest.application.billing,
        );
      }

      await this.installationService.forEachBatch({
        applicationRegistrationId,
        mode: 'credit',
        processBatch: async (applications) => {
          for (const { id, workspaceId, billing } of applications) {
            applicationIds.push(id);
            workspaceIds.add(workspaceId);

            if (!isDefined(billing)) {
              continue;
            }

            billingDefinitions.set(JSON.stringify(billing), billing);
          }
        },
      });

      const usageRows =
        applicationIds.length === 0
          ? []
          : await this.clickHouseService.selectOrThrow<CreditUsageRow>({
              query: `SELECT resourceType, operationType, resourceContext, sum(creditsUsedMicro) AS creditsUsedMicro
           FROM usageEvent
           WHERE workspaceId IN ${toClickHouseUuidTuple([...workspaceIds])}
             AND applicationId IN ${toClickHouseUuidTuple(applicationIds)}
           GROUP BY resourceType, operationType, resourceContext`,
              clickhouseSettings: {
                max_execution_time: 10,
                max_query_size: '10000000',
              },
            });

      return buildApplicationCreditBreakdown({
        billingDefinitions: [...billingDefinitions.values()],
        usageRows,
      });
    } catch (error) {
      this.logger.warn('Failed to load application credit usage', error);
      return null;
    }
  }
}
