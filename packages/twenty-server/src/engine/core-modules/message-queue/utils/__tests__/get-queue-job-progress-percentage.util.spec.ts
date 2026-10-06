import { getQueueJobProgressPercentage } from 'src/engine/core-modules/message-queue/utils/get-queue-job-progress-percentage.util';

describe('getQueueJobProgressPercentage', () => {
  it.each([
    [0, 0],
    [42, 42],
    [42.6, 43],
    [100, 100],
    [120, 100],
    [-5, 0],
  ])('maps the numeric progress %p to %p', (progress, expected) => {
    expect(getQueueJobProgressPercentage(progress)).toBe(expected);
  });

  it.each([undefined, null, Number.NaN, 'half', { completed: 5, total: 10 }])(
    'ignores the non-percentage progress %p',
    (progress) => {
      expect(getQueueJobProgressPercentage(progress)).toBeUndefined();
    },
  );
});
