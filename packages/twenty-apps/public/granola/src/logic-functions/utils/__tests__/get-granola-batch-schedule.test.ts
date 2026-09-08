import { describe, expect, it } from 'vitest';

import { getGranolaBatchSchedule } from 'src/logic-functions/utils/get-granola-batch-schedule.util';

describe('getGranolaBatchSchedule', () => {
  it('spaces note jobs by four seconds after the existing reservation', () => {
    expect(
      getGranolaBatchSchedule({
        now: 1000,
        nextAvailableAt: 11000,
        batchCount: 3,
      }),
    ).toEqual({
      batchDelays: [10000, 14000, 18000],
      continuationDelay: 22000,
      nextBatchAvailableAt: 23000,
    });
  });

  it('does not schedule in the past and paces empty pages', () => {
    expect(
      getGranolaBatchSchedule({
        now: 1000,
        nextAvailableAt: 10,
        batchCount: 0,
      }),
    ).toEqual({
      batchDelays: [],
      continuationDelay: 4000,
      nextBatchAvailableAt: 1000,
    });
  });
});
