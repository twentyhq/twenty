import { describe, expect, it } from 'vitest';

import { getConferenceRecordNameFromArtifactName } from 'src/logic-functions/utils/get-conference-record-name-from-artifact-name.util';

describe('getConferenceRecordNameFromArtifactName', () => {
  it('should return the conference a transcript or smart note belongs to', () => {
    expect(
      getConferenceRecordNameFromArtifactName(
        'conferenceRecords/first/transcripts/second',
      ),
    ).toBe('conferenceRecords/first');
    expect(
      getConferenceRecordNameFromArtifactName(
        'conferenceRecords/first/smartNotes/second',
      ),
    ).toBe('conferenceRecords/first');
  });

  it('should return nothing for a name that is not a transcript or smart note', () => {
    expect(
      getConferenceRecordNameFromArtifactName('conferenceRecords/first'),
    ).toBeUndefined();
    expect(
      getConferenceRecordNameFromArtifactName(
        'conferenceRecords/first/recordings/second',
      ),
    ).toBeUndefined();
    expect(
      getConferenceRecordNameFromArtifactName(
        'spaces/first/transcripts/second',
      ),
    ).toBeUndefined();
    expect(
      getConferenceRecordNameFromArtifactName(
        'conferenceRecords/first/transcripts/second/entries/third',
      ),
    ).toBeUndefined();
  });
});
