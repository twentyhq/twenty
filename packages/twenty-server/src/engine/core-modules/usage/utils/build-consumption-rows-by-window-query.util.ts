import { formatDateTimeForClickHouse } from 'src/database/clickhouse/utils/format-date-time-for-clickhouse.util';
import { type UsageConsumptionWindow } from 'src/engine/core-modules/usage/types/usage-consumption-window.type';
import { buildUsagePeriodClause } from 'src/engine/core-modules/usage/utils/build-usage-period-clause.util';

const SCOPE_COLUMNS = `resourceType, operationType, userWorkspaceId, apiKeyId,
              applicationId, agentId, workflowId, logicFunctionId`;

// Each branch keeps the grouping and the filtered keys of the
// consumption_by_scope projection, which ClickHouse only picks on a full key
// match: splitting the windows with sumIf instead drops the projection.
export const buildConsumptionRowsByWindowQuery = (
  windows: UsageConsumptionWindow[],
): { query: string; params: Record<string, unknown> } => {
  const params: Record<string, unknown> = {};

  const branches = windows.map((window, index) => {
    params[`windowKey${index}`] = window.windowKey;
    params[`resourceTypes${index}`] = window.resourceTypes;
    params[`periodStart${index}`] = formatDateTimeForClickHouse(
      window.periodStart,
    );
    params[`periodEnd${index}`] = formatDateTimeForClickHouse(window.periodEnd);

    return `SELECT {windowKey${index}:String} AS windowKey,
              ${SCOPE_COLUMNS},
              sum(creditsUsedMicro) AS creditsUsedMicro,
              sum(quantity) AS quantity
       FROM usageEvent
       WHERE workspaceId = {workspaceId:String}
         AND resourceType IN ({resourceTypes${index}:Array(String)})
         ${buildUsagePeriodClause(window.periodAnchor, String(index))}
       GROUP BY ${SCOPE_COLUMNS}`;
  });

  return { query: branches.join('\nUNION ALL\n'), params };
};
