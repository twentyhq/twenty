import { describe, expect, it } from 'vitest';

import { buildGoogleMeetDiscoveryJob } from 'src/logic-functions/utils/build-google-meet-discovery-job.util';

const NOW = new Date('2026-11-17T10:15:00Z');

describe('buildGoogleMeetDiscoveryJob', () => {
  it('should name the job after its trigger, connection and current hour', () => {
    expect(
      buildGoogleMeetDiscoveryJob({
        connectedAccountId: 'connected-account-id',
        trigger: 'schedule',
        now: NOW,
      }),
    ).toEqual({
      jobId: 'google-meet-discovery-schedule-connected-account-id-498586',
      payload: { connectedAccountId: 'connected-account-id' },
    });
  });

  it('should not share a job id between a new connection and the schedule', () => {
    const buildJobId = (trigger: 'schedule' | 'connect') =>
      buildGoogleMeetDiscoveryJob({
        connectedAccountId: 'connected-account-id',
        trigger,
        now: NOW,
      }).jobId;

    expect(buildJobId('connect')).not.toBe(buildJobId('schedule'));
  });
});
