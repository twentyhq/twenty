import { describe, expect, it } from 'vitest';

import { mapGoogleMeetTranscriptEntries } from 'src/logic-functions/utils/map-google-meet-transcript-entries.util';

const CONFERENCE_RECORD = { startTime: '2026-11-17T09:00:00Z' };

const PARTICIPANTS = [
  {
    name: 'conferenceRecords/first/participants/alice',
    signedinUser: { displayName: 'Alice Martin' },
  },
  {
    name: 'conferenceRecords/first/participants/guest',
    anonymousUser: { displayName: ' Bob ' },
  },
  {
    name: 'conferenceRecords/first/participants/caller',
    phoneUser: { displayName: '+1 ***-***-1234' },
  },
];

describe('mapGoogleMeetTranscriptEntries', () => {
  it('should name each speaker and time each entry from the start of the conference', () => {
    expect(
      mapGoogleMeetTranscriptEntries({
        conferenceRecord: CONFERENCE_RECORD,
        participants: PARTICIPANTS,
        transcriptEntries: [
          {
            participant: 'conferenceRecords/first/participants/alice',
            text: 'Hello.',
            startTime: '2026-11-17T09:00:05Z',
          },
          {
            participant: 'conferenceRecords/first/participants/guest',
            text: 'Hi Alice.',
            startTime: '2026-11-17T09:00:07.500Z',
          },
          {
            participant: 'conferenceRecords/first/participants/caller',
            text: 'Can you hear me?',
            startTime: '2026-11-17T09:01:00Z',
          },
        ],
      }),
    ).toEqual([
      {
        participant: { name: 'Alice Martin' },
        words: [{ text: 'Hello.', start_timestamp: { relative: 5 } }],
      },
      {
        participant: { name: 'Bob' },
        words: [{ text: 'Hi Alice.', start_timestamp: { relative: 7.5 } }],
      },
      {
        participant: { name: '+1 ***-***-1234' },
        words: [
          { text: 'Can you hear me?', start_timestamp: { relative: 60 } },
        ],
      },
    ]);
  });

  it('should order entries from several transcripts by start time', () => {
    const transcript = mapGoogleMeetTranscriptEntries({
      conferenceRecord: CONFERENCE_RECORD,
      participants: PARTICIPANTS,
      transcriptEntries: [
        { text: 'Second.', startTime: '2026-11-17T09:10:00Z' },
        { text: 'First.', startTime: '2026-11-17T09:05:00Z' },
      ],
    });

    expect(transcript.map(({ words }) => words[0].text)).toEqual([
      'First.',
      'Second.',
    ]);
  });

  it('should keep an entry whose speaker is unknown without a name', () => {
    expect(
      mapGoogleMeetTranscriptEntries({
        conferenceRecord: CONFERENCE_RECORD,
        participants: PARTICIPANTS,
        transcriptEntries: [
          {
            participant: 'conferenceRecords/first/participants/unlisted',
            text: 'Hello.',
            startTime: '2026-11-17T09:00:05Z',
          },
        ],
      }),
    ).toEqual([
      {
        participant: { name: null },
        words: [{ text: 'Hello.', start_timestamp: { relative: 5 } }],
      },
    ]);
  });

  it('should skip entries without text or start time', () => {
    expect(
      mapGoogleMeetTranscriptEntries({
        conferenceRecord: CONFERENCE_RECORD,
        participants: PARTICIPANTS,
        transcriptEntries: [
          { text: '   ', startTime: '2026-11-17T09:00:05Z' },
          { text: 'No start time.' },
        ],
      }),
    ).toEqual([]);
  });

  it('should not time an entry before the start of the conference', () => {
    const [transcriptEntry] = mapGoogleMeetTranscriptEntries({
      conferenceRecord: CONFERENCE_RECORD,
      participants: PARTICIPANTS,
      transcriptEntries: [
        { text: 'Early.', startTime: '2026-11-17T08:59:59Z' },
      ],
    });

    expect(transcriptEntry.words[0].start_timestamp.relative).toBe(0);
  });
});
