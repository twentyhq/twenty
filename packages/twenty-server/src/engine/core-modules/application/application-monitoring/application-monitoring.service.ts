import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { getApplicationMonitoringLookbackInHours } from 'twenty-shared/utils';
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
import { mapApplicationMonitoringRows } from 'src/engine/core-modules/application/application-monitoring/utils/map-application-monitoring-rows.util';
import { mapApplicationMonitoringWorkspaceRows } from 'src/engine/core-modules/application/application-monitoring/utils/map-application-monitoring-workspace-rows.util';
import {
  type ApplicationMonitoringPeriod,
  resolveApplicationMonitoringPeriod,
} from 'src/engine/core-modules/application/application-monitoring/utils/resolve-application-monitoring-period.util';
import { EventLogRetentionService } from 'src/engine/core-modules/event-logs/retention/services/event-log-retention.service';
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
  constructor(
    private readonly clickHouseService: ClickHouseService,
    private readonly eventLogRetentionService: EventLogRetentionService,
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
      select: ['id', 'displayName'],
      withDeleted: true,
    });

    return {
      ...monitoring,
      activeWorkspaceCount: Number(
        activeWorkspaceCountRows[0]?.activeWorkspaceCount ?? 0,
      ),
      workspaces: mapApplicationMonitoringWorkspaceRows({
        rows: workspaceRows,
        workspaceNameById: new Map(
          workspaces.map((workspace) => [
            workspace.id,
            workspace.displayName ?? null,
          ]),
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
    const [totals, activity, lifecycle, issues, versions, functions] =
      await Promise.all([
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
      ]);

    return mapApplicationMonitoringRows({
      period,
      lookbackInHours,
      rows: { totals, activity, lifecycle, issues, versions, functions },
    });
  }
}
