import { computeJobSizeBytes } from 'src/engine/core-modules/message-queue/utils/compute-job-size-bytes.util';

describe('computeJobSizeBytes', () => {
  it('adds the serialized data, the serialized options and a fixed overhead', () => {
    expect(
      computeJobSizeBytes({ data: { a: 1 }, options: { priority: 2 } }),
    ).toBe('{"a":1}'.length + '{"priority":2}'.length + 1024);
  });

  it('counts multi-byte characters in bytes', () => {
    expect(computeJobSizeBytes({ data: 'é', options: {} })).toBe(4 + 2 + 1024);
  });

  it('handles undefined data', () => {
    expect(computeJobSizeBytes({ data: undefined, options: {} })).toBe(
      2 + 1024,
    );
  });
});
