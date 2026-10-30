import { describe, expect, it } from 'vitest';

import { selectTeamsCallRecordingIdsToSummarize } from 'src/features/transcripts/logic-functions/utils/select-teams-call-recording-ids-to-summarize';

const TEAMS_APPLICATION_ID = 'teams-application';

const TRANSCRIPT = [
  {
    participant: { name: 'Alice Martin' },
    words: [{ text: 'Hello.', start_timestamp: { relative: 0 } }],
  },
];

const buildEvent = (
  recordId: string,
  after: { applicationId?: string | null; transcript?: unknown },
) => ({ recordId, properties: { after } });

describe('selectTeamsCallRecordingIdsToSummarize', () => {
  it('should keep each Teams recording that has a transcript once', () => {
    expect(
      selectTeamsCallRecordingIdsToSummarize({
        applicationId: TEAMS_APPLICATION_ID,
        events: [
          buildEvent('recording-1', {
            applicationId: TEAMS_APPLICATION_ID,
            transcript: TRANSCRIPT,
          }),
          buildEvent('recording-2', {
            applicationId: TEAMS_APPLICATION_ID,
            transcript: TRANSCRIPT,
          }),
          buildEvent('recording-1', {
            applicationId: TEAMS_APPLICATION_ID,
            transcript: TRANSCRIPT,
          }),
        ],
      }),
    ).toEqual(['recording-1', 'recording-2']);
  });

  it('should skip recordings from other apps and recordings without a transcript', () => {
    expect(
      selectTeamsCallRecordingIdsToSummarize({
        applicationId: TEAMS_APPLICATION_ID,
        events: [
          buildEvent('call-recorder-recording', {
            applicationId: 'call-recorder-application',
            transcript: TRANSCRIPT,
          }),
          buildEvent('unstamped-recording', {
            applicationId: null,
            transcript: TRANSCRIPT,
          }),
          buildEvent('processing-recording', {
            applicationId: TEAMS_APPLICATION_ID,
          }),
          buildEvent('emptied-recording', {
            applicationId: TEAMS_APPLICATION_ID,
            transcript: [],
          }),
          { recordId: 'missing-snapshot', properties: {} },
        ],
      }),
    ).toEqual([]);
  });

  it('should select nothing when the application id is unknown', () => {
    expect(
      selectTeamsCallRecordingIdsToSummarize({
        applicationId: undefined,
        events: [buildEvent('recording-1', { transcript: TRANSCRIPT })],
      }),
    ).toEqual([]);
  });
});
