import { JOB_SIZE_OVERHEAD_BYTES } from 'src/engine/core-modules/message-queue/constants/job-size-overhead-bytes.constant';
import { computeQueueJobSizeBytes } from 'src/engine/core-modules/message-queue/utils/compute-queue-job-size-bytes.util';

describe('computeQueueJobSizeBytes', () => {
  it('sums the serialized data, the serialized options and the fixed overhead', () => {
    expect(
      computeQueueJobSizeBytes({
        data: { payload: 'abc' },
        options: { attempts: 1 },
      }),
    ).toBe(
      '{"payload":"abc"}'.length +
        '{"attempts":1}'.length +
        JOB_SIZE_OVERHEAD_BYTES,
    );
  });

  it('counts bytes, not characters', () => {
    expect(computeQueueJobSizeBytes({ data: 'é', options: {} })).toBe(
      '"é"'.length + 1 + '{}'.length + JOB_SIZE_OVERHEAD_BYTES,
    );
  });

  it('counts undefined data as empty', () => {
    expect(computeQueueJobSizeBytes({ data: undefined, options: {} })).toBe(
      '{}'.length + JOB_SIZE_OVERHEAD_BYTES,
    );
  });
});
