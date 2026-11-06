import { JobMemoryLimiter } from 'src/engine/core-modules/message-queue/drivers/memory/job-memory-limiter';
import { JobSizeLimiter } from 'src/engine/core-modules/message-queue/drivers/memory/job-size-limiter';
import { type MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type RedisScriptClient } from 'src/engine/core-modules/message-queue/utils/run-redis-script.util';
import { type MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export const createJobMemoryLimiters = ({
  getClient,
  keyPrefix,
  metricsService,
  twentyConfigService,
}: {
  getClient: (queueName: MessageQueue) => Promise<RedisScriptClient>;
  keyPrefix: string;
  metricsService: MetricsService;
  twentyConfigService: TwentyConfigService;
}): { jobSizeLimiter: JobSizeLimiter; jobMemoryLimiter: JobMemoryLimiter } => {
  return {
    jobSizeLimiter: new JobSizeLimiter(metricsService, twentyConfigService),
    jobMemoryLimiter: new JobMemoryLimiter({
      getClient,
      keyPrefix,
      metricsService,
      twentyConfigService,
    }),
  };
};
