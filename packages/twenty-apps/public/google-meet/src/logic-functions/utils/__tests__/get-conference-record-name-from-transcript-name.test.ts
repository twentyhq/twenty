import { describe, expect, it } from 'vitest';

import { getConferenceRecordNameFromTranscriptName } from 'src/logic-functions/utils/get-conference-record-name-from-transcript-name.util';

describe('getConferenceRecordNameFromTranscriptName', () => {
  it('should return the conference a transcript belongs to', () => {
    expect(
      getConferenceRecordNameFromTranscriptName(
        'conferenceRecords/first/transcripts/second',
      ),
    ).toBe('conferenceRecords/first');
  });

  it('should return nothing for a name that is not a transcript', () => {
    expect(
      getConferenceRecordNameFromTranscriptName('conferenceRecords/first'),
    ).toBeUndefined();
    expect(
      getConferenceRecordNameFromTranscriptName(
        'spaces/first/transcripts/second',
      ),
    ).toBeUndefined();
    expect(
      getConferenceRecordNameFromTranscriptName(
        'conferenceRecords/first/transcripts/second/entries/third',
      ),
    ).toBeUndefined();
  });
});
