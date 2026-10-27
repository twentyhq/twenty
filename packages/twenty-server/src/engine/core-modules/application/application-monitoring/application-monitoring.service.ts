import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { In, Repository } from 'typeorm';

import { ClickHouseService } from 'src/database/clickhouse/clickhouse.service';
import { formatDateTimeForClickHouse } from 'src/database/clickhouse/utils/format-date-time-for-clickhouse.util';
import { APPLICATION_MONITORING_QUERIES } from 'src/engine/core-modules/application/application-monitoring/constants/application-monitoring-queries.constant';
import { type AdminApplicationMonitoringDTO } from 'src/engine/core-modules/application/application-monitoring/dtos/admin-application-monitoring.dto';
import { type ApplicationMonitoringDTO } from 'src/engine/core-modules/application/application-monitoring/dtos/application-monitoring.dto';
import {
  type ApplicationMonitoringActiveWorkspaceCountRow,
  type ApplicationMonitoringActivityRow,
  type ApplicationMonitoringFunctionRow,
  type ApplicationMonitoringIssueRow,
  type ApplicationMonitoringLifecycleRow,
  type ApplicationMonitoringTotalsRow,
  type ApplicationMonitoringVersionRow,
  type ApplicationMonitoringWorkspaceRow,
} from 'src/engine/core-modules/application/application-monitoring/types/application-monitoring-rows.type';
import { getApplicationMonitoringLookbackInHours } from 'src/engine/core-modules/application/application-monitoring/utils/get-application-monitoring-lookback-in-hours.util';
import { mapApplicationMonitoringRows } from 'src/engine/core-modules/application/application-monitoring/utils/map-application-monitoring-rows.util';
import { mapApplicationMonitoringWorkspaceRows } from 'src/engine/core-modules/application/application-monitoring/utils/map-application-monitoring-workspace-rows.util';
import {
  type ApplicationMonitoringPeriod,
  resolveApplicationMonitoringPeriod,
} from 'src/engine/core-modules/application/application-monitoring/utils/resolve-application-monitoring-period.util';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { EventLogRetentionService } from 'src/engine/core-modules/event-logs/retention/services/event-log-retention.service';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { UsageAnalyticsService } from 'src/engine/core-modules/usage/services/usage-analytics.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

type ApplicationMonitoringQueryParams = {
  applicationRegistrationId: string;
  workspaceId: string;
  periodStart: string;
  periodEnd: string;
  bucketSizeInSeconds: number;
};

type GetApplicationMonitoringArgs = {
  applicationRegistrationId: string;
  viewerWorkspaceId: string;
  periodStart?: Date;
  periodEnd?: Date;
};

@Injectable()
export class ApplicationMonitoringService {
  private readonly logger = new Logger(ApplicationMonitoringService.name);

  constructor(
    private readonly clickHouseService: ClickHouseService,
    private readonly eventLogRetentionService: EventLogRetentionService,
    private readonly applicationRegistrationService: ApplicationRegistrationService,
    private readonly usageAnalyticsService: UsageAnalyticsService,
    private readonly fileUrlService: FileUrlService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  async getMonitoring(
    args: GetApplicationMonitoringArgs,
  ): Promise<ApplicationMonitoringDTO> {
    const { params, period, lookbackInHours } =
      await this.resolveQueryParams(args);

    return this.queryMonitoring({ params, period, lookbackInHours });
  }

  async getAdminMonitoring({
    workspaceId,
    ...args
  }: GetApplicationMonitoringArgs & {
    workspaceId?: string;
  }): Promise<AdminApplicationMonitoringDTO> {
    const { params, period, lookbackInHours } = await this.resolveQueryParams({
      ...args,
      workspaceId,
    });

    const [monitoring, activeWorkspaceCountRows, workspaceRows] =
      await Promise.all([
        this.queryMonitoring({ params, period, lookbackInHours }),
        this.clickHouseService.selectOrThrow<ApplicationMonitoringActiveWorkspaceCountRow>(
          APPLICATION_MONITORING_QUERIES.activeWorkspaceCount,
          params,
        ),
        this.clickHouseService.selectOrThrow<ApplicationMonitoringWorkspaceRow>(
          APPLICATION_MONITORING_QUERIES.workspaces,
          params,
        ),
      ]);

    const workspaces = await this.workspaceRepository.find({
      where: { id: In(workspaceRows.map((row) => row.workspaceId)) },
      select: ['id', 'displayName', 'logoFileId'],
      withDeleted: true,
    });

    return {
      ...monitoring,
      activeWorkspaceCount: Number(
        activeWorkspaceCountRows[0]?.activeWorkspaceCount ?? 0,
      ),
      workspaces: mapApplicationMonitoringWorkspaceRows({
        rows: workspaceRows,
        workspaces: await Promise.all(
          workspaces.map(async (workspace) => ({
            workspaceId: workspace.id,
            workspaceName: workspace.displayName ?? null,
            workspaceLogoUrl:
              await this.fileUrlService.signWorkspaceLogoUrl(workspace),
          })),
        ),
      }),
    };
  }

  private async resolveQueryParams({
    applicationRegistrationId,
    viewerWorkspaceId,
    periodStart,
    periodEnd,
    workspaceId,
  }: GetApplicationMonitoringArgs & { workspaceId?: string }): Promise<{
    params: ApplicationMonitoringQueryParams;
    period: ApplicationMonitoringPeriod;
    lookbackInHours: number;
  }> {
    const lookbackInHours = getApplicationMonitoringLookbackInHours({
      hasAuditLogsEntitlement:
        await this.eventLogRetentionService.hasAuditLogsEntitlement(
          viewerWorkspaceId,
        ),
    });

    const period = resolveApplicationMonitoringPeriod({
      periodStart,
      periodEnd,
      lookbackInHours,
    });

    return {
      params: {
        applicationRegistrationId,
        workspaceId: workspaceId ?? '',
        periodStart: formatDateTimeForClickHouse(period.periodStart),
        periodEnd: formatDateTimeForClickHouse(period.periodEnd),
        bucketSizeInSeconds: period.bucketSizeInSeconds,
      },
      period,
      lookbackInHours,
    };
  }

  private async queryMonitoring({
    params,
    period,
    lookbackInHours,
  }: {
    params: ApplicationMonitoringQueryParams;
    period: ApplicationMonitoringPeriod;
    lookbackInHours: number;
  }): Promise<ApplicationMonitoringDTO> {
    const [
      totals,
      activity,
      lifecycle,
      issues,
      versions,
      functions,
      creditUsage,
    ] = await Promise.all([
      this.clickHouseService.selectOrThrow<ApplicationMonitoringTotalsRow>(
        APPLICATION_MONITORING_QUERIES.totals,
        params,
      ),
      this.clickHouseService.selectOrThrow<ApplicationMonitoringActivityRow>(
        APPLICATION_MONITORING_QUERIES.activity,
        params,
      ),
      this.clickHouseService.selectOrThrow<ApplicationMonitoringLifecycleRow>(
        APPLICATION_MONITORING_QUERIES.lifecycle,
        params,
      ),
      this.clickHouseService.selectOrThrow<ApplicationMonitoringIssueRow>(
        APPLICATION_MONITORING_QUERIES.issues,
        params,
      ),
      this.clickHouseService.selectOrThrow<ApplicationMonitoringVersionRow>(
        APPLICATION_MONITORING_QUERIES.versions,
        params,
      ),
      this.clickHouseService.selectOrThrow<ApplicationMonitoringFunctionRow>(
        APPLICATION_MONITORING_QUERIES.functions,
        params,
      ),
      this.queryCreditUsage({ params, period }),
    ]);

    return mapApplicationMonitoringRows({
      period,
      lookbackInHours,
      rows: { totals, activity, lifecycle, issues, versions, functions },
      creditUsage,
    });
  }

  private async queryCreditUsage({
    params,
    period,
  }: {
    params: Pick<
      ApplicationMonitoringQueryParams,
      'applicationRegistrationId' | 'workspaceId'
    >;
    period: ApplicationMonitoringPeriod;
  }): Promise<
    | {
        bucketStart: Date;
        operationType: string;
        creditsUsedMicro: number;
      }[]
    | null
  > {
    try {
      const installations =
        await this.applicationRegistrationService.findInstallations({
          applicationRegistrationId: params.applicationRegistrationId,
          workspaceId: isNonEmptyString(params.workspaceId)
            ? params.workspaceId
            : undefined,
        });

      return await this.usageAnalyticsService.getCreditsUsedTimeSeriesForInstallations(
        { installations, ...period },
      );
    } catch (error) {
      this.logger.warn(
        `Failed to load credits used for registration ${params.applicationRegistrationId}`,
        error,
      );

      return null;
    }
  }
}
