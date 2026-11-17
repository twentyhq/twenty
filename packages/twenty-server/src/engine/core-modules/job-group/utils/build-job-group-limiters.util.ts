import { isDefined } from 'twenty-shared/utils';

import { DEFAULT_JOB_GROUP_CONFIG_BY_KEY } from 'src/engine/core-modules/job-group/constants/default-job-group-config-by-key.constant';
import { type JobGroupConfigByKey } from 'src/engine/core-modules/job-group/types/job-group-config-by-key.type';
import { type QueueJobLimiter } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';

export const buildJobGroupLimiters = ({
  jobGroupKeys,
  jobGroupConfigByKey,
}: {
  jobGroupKeys: string[];
  jobGroupConfigByKey: JobGroupConfigByKey;
}): QueueJobLimiter[] =>
  [...new Set(jobGroupKeys)].flatMap((jobGroupKey) => {
    const limiter = (
      jobGroupConfigByKey[jobGroupKey] ??
      DEFAULT_JOB_GROUP_CONFIG_BY_KEY[jobGroupKey]
    )?.limiter;

    return isDefined(limiter)
      ? [
          {
            key: `jobGroup:${jobGroupKey}`,
            max: limiter.max,
            durationMs: limiter.durationMs,
          },
        ]
      : [];
  });
