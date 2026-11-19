import { type JobConfigManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type GroupLimiter } from 'src/engine/core-modules/message-queue/drivers/fairness/group-rate-pacer';
import { buildApplicationGroupKey } from 'src/engine/core-modules/message-queue/utils/build-application-group-key.util';

export const buildJobConfigGroupLimiters = ({
  applicationUniversalIdentifier,
  jobConfigs,
  jobConfigKeys,
}: {
  applicationUniversalIdentifier: string;
  // Undefined until the 2.61 instance command adds the columns
  jobConfigs: JobConfigManifest[] | undefined;
  jobConfigKeys: (string | undefined)[] | undefined;
}): GroupLimiter[] =>
  [...new Set((jobConfigKeys ?? []).filter(isDefined))].flatMap(
    (jobConfigKey) => {
      const jobConfig = jobConfigs?.find(({ key }) => key === jobConfigKey);

      return isDefined(jobConfig)
        ? [
            {
              groupKey: `${buildApplicationGroupKey(applicationUniversalIdentifier)}:jobConfig:${jobConfigKey}`,
              limiter: jobConfig.limiter,
            },
          ]
        : [];
    },
  );
