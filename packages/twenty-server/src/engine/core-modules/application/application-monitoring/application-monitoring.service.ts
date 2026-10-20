import { Injectable } from '@nestjs/common';

import { getApplicationMonitoringLookbackInHours } from 'twenty-shared/utils';

import { ClickHouseService } from 'src/database/clickhouse/clickhouse.service';
import { formatDateTimeForClickHouse } from 'src/database/clickhouse/utils/format-date-time-for-clickhouse.util';
import { APPLICATION_MONITORING_QUERIES } from 'src/engine/core-modules/application/application-monitoring/constants/application-monitoring-queries.constant';
import { type ApplicationMonitoringDTO } from 'src/engine/core-modules/application/application-monitoring/dtos/application-monitoring.dto';
import {
  type ApplicationMonitoringActivityRow,
  type ApplicationMonitoringFunctionRow,
  type ApplicationMonitoringIssueRow,
  type ApplicationMonitoringLifecycleRow,
  type ApplicationMonitoringTotalsRow,
  type ApplicationMonitoringVersionRow,
} from 'src/engine/core-modules/application/application-monitoring/types/application-monitoring-rows.type';
import { mapApplicationMonitoringRows } from 'src/engine/core-modules/application/application-monitoring/utils/map-application-monitoring-rows.util';
import { resolveApplicationMonitoringPeriod } from 'src/engine/core-modules/application/application-monitoring/utils/resolve-application-monitoring-period.util';
import { EventLogRetentionService } from 'src/engine/core-modules/event-logs/retention/services/event-log-retention.service';

@Injectable()
export class ApplicationMonitoringService {
  constructor(
    private readonly clickHouseService: ClickHouseService,
    private readonly eventLogRetentionService: EventLogRetentionService,
  ) {}

  async getMonitoring({
    applicationRegistrationId,
    viewerWorkspaceId,
    periodStart,
    periodEnd,
  }: {
    applicationRegistrationId: string;
    viewerWorkspaceId: string;
    periodStart?: Date;
    periodEnd?: Date;
  }): Promise<ApplicationMonitoringDTO> {
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

    const params = {
      applicationRegistrationId,
      periodStart: formatDateTimeForClickHouse(period.periodStart),
      periodEnd: formatDateTimeForClickHouse(period.periodEnd),
      bucketSizeInSeconds: period.bucketSizeInSeconds,
    };

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
