import { isNonEmptyString } from '@sniptt/guards';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { formatDateTimeForClickHouse } from 'src/database/clickhouse/utils/format-date-time-for-clickhouse.util';
import { type AdminApplicationLogsInput } from 'src/engine/core-modules/application/application-monitoring/dtos/admin-application-logs.input';
import { type ApplicationMonitoringPeriod } from 'src/engine/core-modules/application/application-monitoring/utils/resolve-application-monitoring-period.util';

export const buildAdminApplicationLogsFilter = ({
  input,
  period,
}: {
  input: AdminApplicationLogsInput;
  period: Pick<ApplicationMonitoringPeriod, 'periodStart' | 'periodEnd'>;
}): { whereClause: string; params: Record<string, unknown> } => {
  const conditions = [
    'applicationRegistrationId = {applicationRegistrationId:String}',
    'timestamp >= {periodStart:DateTime64(3)}',
    'timestamp < {periodEnd:DateTime64(3)}',
  ];
  const params: Record<string, unknown> = {
    applicationRegistrationId: input.applicationRegistrationId,
    periodStart: formatDateTimeForClickHouse(period.periodStart),
    periodEnd: formatDateTimeForClickHouse(period.periodEnd),
  };

  if (isNonEmptyString(input.workspaceId)) {
    conditions.push('workspaceId = {workspaceId:String}');
    params.workspaceId = input.workspaceId;
  }

  if (isNonEmptyArray(input.levels)) {
    conditions.push('level IN {levels:Array(String)}');
    params.levels = input.levels;
  }

  if (isNonEmptyString(input.logicFunctionName)) {
    conditions.push('logicFunctionName = {logicFunctionName:String}');
    params.logicFunctionName = input.logicFunctionName;
  }

  if (isNonEmptyString(input.search)) {
    conditions.push('positionCaseInsensitive(message, {search:String}) > 0');
    params.search = input.search;
  }

  return { whereClause: conditions.join(' AND '), params };
};
