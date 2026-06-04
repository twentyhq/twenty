/* @license Enterprise */

import { formatDateTimeForClickHouse } from 'src/database/clickHouse/clickHouse.util';
import { type WorkspaceEventEnvelope } from 'src/engine/core-modules/event-logs/types/workspace-event-envelope.type';
import { type UsageEvent } from 'src/engine/core-modules/usage/types/usage-event.type';

export const buildUsageEventEnvelopes = (
  workspaceId: string,
  usageEvents: UsageEvent[],
): WorkspaceEventEnvelope[] => {
  const now = formatDateTimeForClickHouse(new Date());

  return usageEvents.map((usageEvent) => ({
    table: 'usageEvent',
    row: {
      timestamp: now,
      workspaceId,
      periodStart: usageEvent.periodStart
        ? formatDateTimeForClickHouse(usageEvent.periodStart)
        : undefined,
      userWorkspaceId: usageEvent.userWorkspaceId ?? '',
      resourceType: usageEvent.resourceType,
      operationType: usageEvent.operationType,
      quantity: usageEvent.quantity,
      unit: usageEvent.unit,
      creditsUsedMicro: usageEvent.creditsUsedMicro,
      resourceId: usageEvent.resourceId ?? '',
      resourceContext: usageEvent.resourceContext ?? '',
      metadata: {},
    },
  }));
};
