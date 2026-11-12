import { isDefined } from 'twenty-shared/utils';

import { type JobMemoryLimitRefusal } from 'src/engine/core-modules/message-queue/drivers/memory/job-memory-limit-refusal.type';

export const buildJobMemoryLimitRefusalLogMessage = ({
  queueName,
  jobName,
  groupKey,
  reason,
  requestedBytes,
  usedBytes,
  limitBytes,
}: JobMemoryLimitRefusal): string => {
  const fields = [
    `key=${groupKey}`,
    `reason=${reason}`,
    `requestedBytes=${requestedBytes}`,
    ...(isDefined(usedBytes) ? [`usedBytes=${usedBytes}`] : []),
    `limitBytes=${limitBytes}`,
  ];

  return `Job memory limit refused for job ${jobName} on queue ${queueName} [${fields.join(' ')}]`;
};
