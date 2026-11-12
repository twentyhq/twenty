import RedisMock from 'ioredis-mock';

import { JOB_MEMORY_ADMIT_SCRIPT } from 'src/engine/core-modules/message-queue/drivers/memory/job-memory-admit-script.constant';

describe('global queue memory admission budget', () => {
  it('does not reserve more than the shared free-memory snapshot across workspaces', async () => {
    const redis = new RedisMock();
    let admittedBytes = 0;

    try {
      for (const workspaceId of ['A', 'B', 'C', 'D']) {
        const result = String(
          await redis.eval(
            JOB_MEMORY_ADMIT_SCRIPT,
            2,
            `bull:jobmem:used:workspace:${workspaceId}`,
            `bull:jobmem:jobs:workspace:${workspaceId}`,
            90_000,
            20_000,
            1,
            0.3,
            1,
            `queue:${workspaceId}`,
            21_000,
            1,
            1,
          ),
        );

        if (result.split(' ')[0] === '0') {
          admittedBytes += 21_000;
        }
      }

      expect(admittedBytes).toBeLessThanOrEqual(70_000);
    } finally {
      redis.disconnect();
    }
  });
});
