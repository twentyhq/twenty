import { describe, expect, it } from 'vitest';

import { buildGoogleMeetConferenceImportJob } from 'src/logic-functions/utils/build-google-meet-conference-import-job.util';
import { computeCallRecordingIdForGoogleMeetConference } from 'src/logic-functions/utils/compute-call-recording-id-for-google-meet-conference.util';

const CONFERENCE_RECORD = {
  name: 'conferenceRecords/first',
  startTime: '2026-11-17T09:00:00Z',
  endTime: '2026-11-17T09:30:00Z',
  space: 'spaces/meeting-space',
};

const buildJob = (now: string) =>
  buildGoogleMeetConferenceImportJob({
    connectedAccountId: 'connected-account-id',
    conferenceRecord: CONFERENCE_RECORD,
    now: new Date(now),
  });

describe('buildGoogleMeetConferenceImportJob', () => {
  it('should carry the connection and the conference to import', () => {
    expect(buildJob('2026-11-17T10:15:00Z').payload).toEqual({
      connectedAccountId: 'connected-account-id',
      conferenceRecordName: 'conferenceRecords/first',
      startTime: '2026-11-17T09:00:00Z',
      endTime: '2026-11-17T09:30:00Z',
      spaceName: 'spaces/meeting-space',
    });
  });

  it('should name the job after the conference and the current hour', () => {
    const callRecordingId = computeCallRecordingIdForGoogleMeetConference(
      'conferenceRecords/first',
    );

    expect(buildJob('2026-11-17T10:15:00Z').jobId).toBe(
      `google-meet-conference-${callRecordingId}-498586`,
    );
  });

  it('should reuse the job id within an hour and change it the next hour', () => {
    expect(buildJob('2026-11-17T10:59:59Z').jobId).toBe(
      buildJob('2026-11-17T10:00:00Z').jobId,
    );
    expect(buildJob('2026-11-17T11:00:00Z').jobId).not.toBe(
      buildJob('2026-11-17T10:59:59Z').jobId,
    );
  });
});
