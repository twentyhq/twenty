import { type GroupKeyMemoryUsage } from 'src/engine/core-modules/message-queue/drivers/memory/job-memory-limiter';

export type GroupKeyMemoryObservation = {
  value: number;
  attributes: { group_key: string; group_type: string };
};

export const buildGroupKeyMemoryObservations = ({
  usages,
  previouslyReportedGroupKeys,
}: {
  usages: GroupKeyMemoryUsage[];
  previouslyReportedGroupKeys: Set<string>;
}): GroupKeyMemoryObservation[] => {
  const currentGroupKeys = new Set(usages.map(({ groupKey }) => groupKey));

  const droppedUsages = [...previouslyReportedGroupKeys]
    .filter((groupKey) => !currentGroupKeys.has(groupKey))
    .map((groupKey) => ({ groupKey, usedBytes: 0 }));

  return [...usages, ...droppedUsages].map(({ groupKey, usedBytes }) => ({
    value: usedBytes,
    attributes: {
      group_key: groupKey,
      group_type: groupKey.slice(0, groupKey.indexOf(':')),
    },
  }));
};
