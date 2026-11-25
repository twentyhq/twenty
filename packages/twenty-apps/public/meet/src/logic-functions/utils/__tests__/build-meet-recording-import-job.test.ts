import { describe, expect, it } from 'vitest';

import { buildMeetRecordingImportJob } from 'src/logic-functions/utils/build-meet-recording-import-job.util';

const buildJob = ({
  recordingName,
  now,
}: {
  recordingName: string;
  now: string;
}) =>
  buildMeetRecordingImportJob({
    connectedAccountId: 'connected-account-id',
    conferenceRecordName: 'conferenceRecords/first',
    recordingName,
    now: new Date(now),
  });

describe('buildMeetRecordingImportJob', () => {
  it('should carry the connection, conference and recording to import', () => {
    expect(
      buildJob({
        recordingName: 'conferenceRecords/first/recordings/second',
        now: '2026-11-17T10:15:00Z',
      }),
    ).toEqual({
      jobId: expect.stringMatching(/^google-meet-recording-[0-9a-f]{64}-498586$/),
      payload: {
        connectedAccountId: 'connected-account-id',
        conferenceRecordName: 'conferenceRecords/first',
        recordingName: 'conferenceRecords/first/recordings/second',
      },
    });
  });

  it('should reuse the job id within an hour and change it the next hour or for another recording', () => {
    const recordingName = 'conferenceRecords/first/recordings/second';

    expect(buildJob({ recordingName, now: '2026-11-17T10:59:59Z' }).jobId).toBe(
      buildJob({ recordingName, now: '2026-11-17T10:00:00Z' }).jobId,
    );
    expect(
      buildJob({ recordingName, now: '2026-11-17T11:00:00Z' }).jobId,
    ).not.toBe(buildJob({ recordingName, now: '2026-11-17T10:59:59Z' }).jobId);
    expect(
      buildJob({
        recordingName: 'conferenceRecords/first/recordings/third',
        now: '2026-11-17T10:00:00Z',
      }).jobId,
    ).not.toBe(buildJob({ recordingName, now: '2026-11-17T10:00:00Z' }).jobId);
  });
});
