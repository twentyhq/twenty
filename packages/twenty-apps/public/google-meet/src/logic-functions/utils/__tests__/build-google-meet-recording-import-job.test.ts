import { describe, expect, it } from 'vitest';

import { buildGoogleMeetRecordingImportJob } from 'src/logic-functions/utils/build-google-meet-recording-import-job.util';

describe('buildGoogleMeetRecordingImportJob', () => {
  it('should build one import job per recording', () => {
    const job = buildGoogleMeetRecordingImportJob({
      connectedAccountId: 'connected-account-id',
      conferenceRecordName: 'conferenceRecords/first',
      recordingName: 'conferenceRecords/first/recordings/second',
    });

    expect(job).toEqual({
      jobId: expect.stringMatching(/^google-meet-recording-[0-9a-f]{64}$/),
      payload: {
        connectedAccountId: 'connected-account-id',
        conferenceRecordName: 'conferenceRecords/first',
        recordingName: 'conferenceRecords/first/recordings/second',
      },
    });
    expect(
      buildGoogleMeetRecordingImportJob({
        connectedAccountId: 'other-connected-account-id',
        conferenceRecordName: 'conferenceRecords/first',
        recordingName: 'conferenceRecords/first/recordings/second',
      }).jobId,
    ).toBe(job.jobId);
    expect(
      buildGoogleMeetRecordingImportJob({
        connectedAccountId: 'connected-account-id',
        conferenceRecordName: 'conferenceRecords/first',
        recordingName: 'conferenceRecords/first/recordings/third',
      }).jobId,
    ).not.toBe(job.jobId);
  });
});
