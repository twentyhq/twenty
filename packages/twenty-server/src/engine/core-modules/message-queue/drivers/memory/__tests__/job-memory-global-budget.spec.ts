import RedisMock from 'ioredis-mock';

import { JOB_MEMORY_RELEASE_SCRIPT } from 'src/engine/core-modules/message-queue/drivers/memory/job-memory-release-script.constant';

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
            4,
            `bull:jobmem:used:workspace:${workspaceId}`,
            `bull:jobmem:jobs:workspace:${workspaceId}`,
            'bull:jobmem:used:global',
            'bull:jobmem:jobs:global',
            90_000,
            20_000,
            2,
            0.3,
            1,
            1,
            `queue:${workspaceId}`,
            21_000,
            2,
            1,
            2,
          ),
        );

        if (result.split(' ')[0] === '0') {
          admittedBytes += 21_000;
        }
      }

      expect(admittedBytes).toBe(63_000);
      await redis.eval(
        JOB_MEMORY_RELEASE_SCRIPT,
        4,
        'bull:jobmem:used:workspace:A',
        'bull:jobmem:jobs:workspace:A',
        'bull:jobmem:used:global',
        'bull:jobmem:jobs:global',
        'queue:A',
      );
      const admissionAfterRelease = String(
        await redis.eval(
          JOB_MEMORY_ADMIT_SCRIPT,
          4,
          'bull:jobmem:used:workspace:D',
          'bull:jobmem:jobs:workspace:D',
          'bull:jobmem:used:global',
          'bull:jobmem:jobs:global',
          90_000,
          20_000,
          2,
          0.3,
          1,
          1,
          'queue:D',
          21_000,
          2,
          1,
          2,
        ),
      );
      expect(admissionAfterRelease.split(' ')[0]).toBe('0');
      expect(await redis.get('bull:jobmem:used:global')).toBe('63000');
    } finally {
      redis.disconnect();
    }
  });
});
