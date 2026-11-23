import { describe, expect, it } from 'vitest';

import { buildGoogleMeetDailyJob } from 'src/logic-functions/utils/build-google-meet-daily-job.util';

describe('buildGoogleMeetDailyJob', () => {
  it('should build one job per connection and day', () => {
    expect(
      buildGoogleMeetDailyJob({
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
      buildGoogleMeetDailyJob({
        jobName: 'catch-up',
        connectedAccountId: 'connected-account-id',
        now: new Date('2026-11-17T23:59:59Z'),
      }).jobId,
    ).toBe('google-meet-catch-up-connected-account-id-20774');
  });
});
