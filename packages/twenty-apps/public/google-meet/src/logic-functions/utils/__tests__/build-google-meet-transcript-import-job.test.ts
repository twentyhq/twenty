import { describe, expect, it } from 'vitest';

import { buildGoogleMeetTranscriptImportJob } from 'src/logic-functions/utils/build-google-meet-transcript-import-job.util';

describe('buildGoogleMeetTranscriptImportJob', () => {
  it('should build one import job per transcript', () => {
    expect(
      buildGoogleMeetTranscriptImportJob({
        connectedAccountId: 'connected-account-id',
        conferenceRecord: {
          name: 'conferenceRecords/first',
          startTime: '2026-11-17T09:00:00Z',
          endTime: '2026-11-17T09:30:00Z',
          space: 'spaces/first',
        },
        transcriptName: 'conferenceRecords/first/transcripts/first',
      }),
    ).toEqual({
      jobId:
        'google-meet-transcript-e5685e9e5899abb1b791785211702ba0ab1b16c997ba23c2967a9b2a81bc49e0',
      payload: {
        connectedAccountId: 'connected-account-id',
        conferenceRecordName: 'conferenceRecords/first',
        startTime: '2026-11-17T09:00:00Z',
        endTime: '2026-11-17T09:30:00Z',
        spaceName: 'spaces/first',
      },
    });
  });
});
