import { describe, expect, it } from 'vitest';

import { type CalendarEventRecordingParticipant } from 'src/front-components/types/calendar-event-recording-participant.type';
import { type TranscriptEntry } from 'src/front-components/types/transcript-entry.type';
import { buildTranscriptPlainText } from 'src/front-components/utils/build-transcript-plain-text.util';

const buildEntry = (
  overrides: Partial<TranscriptEntry> & Pick<TranscriptEntry, 'speakerName'>,
): TranscriptEntry => ({
  startSeconds: undefined,
  endSeconds: undefined,
  text: '',
  words: [],
  ...overrides,
});

describe('buildTranscriptPlainText', () => {
  it('renders each entry with speaker, timestamp, and text separated by blank lines', () => {
    const entries: TranscriptEntry[] = [
      buildEntry({
        speakerName: 'Ada Lovelace',
        startSeconds: 72,
        text: 'Hello there',
      }),
      buildEntry({
        speakerName: 'Grace Hopper',
        startSeconds: 130,
        text: 'Hi',
      }),
    ];

    expect(
      buildTranscriptPlainText({ entries, calendarEventParticipants: [] }),
    ).toBe('Ada Lovelace (1:12)\nHello there\n\nGrace Hopper (2:10)\nHi');
  });

  it('omits the timestamp when the entry has no start time', () => {
    const entries: TranscriptEntry[] = [
      buildEntry({ speakerName: 'Ada Lovelace', text: 'Hello there' }),
    ];

    expect(
      buildTranscriptPlainText({ entries, calendarEventParticipants: [] }),
    ).toBe('Ada Lovelace\nHello there');
  });

  it('prefers the matched participant display name over the raw speaker label', () => {
    const entries: TranscriptEntry[] = [
      buildEntry({
        speakerName: 'ada lovelace',
        startSeconds: 0,
        text: 'Hello there',
      }),
    ];
    const calendarEventParticipants: CalendarEventRecordingParticipant[] = [
      {
        id: 'participant-1',
        avatarUrl: undefined,
        displayName: 'Ada L.',
        nameCandidates: ['Ada Lovelace'],
        placeholderColorSeed: 'participant-1',
      },
    ];

    expect(
      buildTranscriptPlainText({ entries, calendarEventParticipants }),
    ).toBe('Ada L. (0:00)\nHello there');
  });
});
