import { describe, expect, it } from 'vitest';

import { buildMeetDailyJob } from 'src/logic-functions/utils/build-meet-daily-job.util';

describe('buildMeetDailyJob', () => {
  it('should build one job per connection and day', () => {
    expect(
      buildMeetDailyJob({
        jobName: 'renewal',
        connectedAccountId: 'connected-account-id',
        now: new Date('2026-11-17T03:23:00Z'),
      }),
    ).toEqual({
      jobId: 'google-meet-renewal-connected-account-id-20774',
      payload: { connectedAccountId: 'connected-account-id' },
    });
  });

  it('should keep the same job id for the whole day', () => {
    expect(
      buildMeetDailyJob({
        jobName: 'catch-up',
        connectedAccountId: 'connected-account-id',
        now: new Date('2026-11-17T23:59:59Z'),
      }).jobId,
    ).toBe('google-meet-catch-up-connected-account-id-20774');
  });
});
