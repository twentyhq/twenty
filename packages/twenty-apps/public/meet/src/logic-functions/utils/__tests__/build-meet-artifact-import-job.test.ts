import { describe, expect, it } from 'vitest';

import { buildMeetArtifactImportJob } from 'src/logic-functions/utils/build-meet-artifact-import-job.util';

describe('buildMeetArtifactImportJob', () => {
  it('should build one import job per transcript or smart note', () => {
    expect(
      buildMeetArtifactImportJob({
        connectedAccountId: 'connected-account-id',
        conferenceRecord: {
          name: 'conferenceRecords/first',
          startTime: '2026-11-17T09:00:00Z',
          endTime: '2026-11-17T09:30:00Z',
          space: 'spaces/first',
        },
        artifactName: 'conferenceRecords/first/transcripts/first',
      }),
    ).toEqual({
      jobId:
        'google-meet-artifact-e5685e9e5899abb1b791785211702ba0ab1b16c997ba23c2967a9b2a81bc49e0',
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
