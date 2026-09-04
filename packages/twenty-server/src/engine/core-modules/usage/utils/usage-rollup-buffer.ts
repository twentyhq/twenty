/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type UsageEvent } from 'src/engine/core-modules/usage/types/usage-event.type';

const ABSENT = '-';

type BufferedRollup = {
  workspaceId: string;
  usageEvent: UsageEvent;
};

const buildRollupKey = (workspaceId: string, usageEvent: UsageEvent): string =>
  [
    workspaceId,
    usageEvent.resourceType,
    usageEvent.operationType,
    usageEvent.unit,
    usageEvent.resourceContext || ABSENT,
    usageEvent.resourceId || ABSENT,
    usageEvent.periodStart?.toISOString() ?? ABSENT,
    usageEvent.spenders?.userWorkspaceId || ABSENT,
    usageEvent.spenders?.apiKeyId || ABSENT,
    usageEvent.spenders?.applicationId || ABSENT,
    usageEvent.spenders?.agentId || ABSENT,
    usageEvent.spenders?.workflowId || ABSENT,
    usageEvent.spenders?.logicFunctionId || ABSENT,
  ].join('|');

export class UsageRollupBuffer {
  private rollupByKey = new Map<string, BufferedRollup>();

  constructor(private readonly maxEntries: number) {}

  get isFull(): boolean {
    return this.rollupByKey.size >= this.maxEntries;
  }

  increment(workspaceId: string, usageEvent: UsageEvent): void {
    const rollupKey = buildRollupKey(workspaceId, usageEvent);
    const bufferedRollup = this.rollupByKey.get(rollupKey);

    if (isDefined(bufferedRollup)) {
      bufferedRollup.usageEvent.quantity += usageEvent.quantity;
      bufferedRollup.usageEvent.creditsUsedMicro += usageEvent.creditsUsedMicro;

      return;
    }

    this.rollupByKey.set(rollupKey, {
      workspaceId,
      usageEvent: { ...usageEvent },
    });
  }

  drain(): Map<string, UsageEvent[]> {
    const drainedRollups = [...this.rollupByKey.values()];

    this.rollupByKey = new Map();

    const usageEventsByWorkspaceId = new Map<string, UsageEvent[]>();

    for (const { workspaceId, usageEvent } of drainedRollups) {
      const usageEvents = usageEventsByWorkspaceId.get(workspaceId) ?? [];

      usageEvents.push(usageEvent);
      usageEventsByWorkspaceId.set(workspaceId, usageEvents);
    }

    return usageEventsByWorkspaceId;
  }
}
