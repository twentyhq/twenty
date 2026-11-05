import { isDefined } from 'twenty-shared/utils';

import { type JobMemoryLimitRefusal } from 'src/engine/core-modules/message-queue/drivers/memory/job-memory-limit-refusal.type';

export const buildJobMemoryLimitRefusalLogMessage = ({
  queueName,
  groupKey,
  reason,
  mode,
  requestedBytes,
  usedBytes,
  limitBytes,
}: JobMemoryLimitRefusal): string => {
  const fields = [
    `key=${groupKey}`,
    `reason=${reason}`,
    `mode=${mode}`,
    `requestedBytes=${requestedBytes}`,
    ...(isDefined(usedBytes) ? [`usedBytes=${usedBytes}`] : []),
    `limitBytes=${limitBytes}`,
  ];

  return `Job memory limit refused on queue ${queueName} [${fields.join(' ')}]`;
};
