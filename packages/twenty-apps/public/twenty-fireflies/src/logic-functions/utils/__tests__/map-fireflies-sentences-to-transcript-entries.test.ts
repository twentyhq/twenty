import { describe, expect, it } from 'vitest';

import { mapFirefliesSentencesToTranscriptEntries } from 'src/logic-functions/utils/map-fireflies-sentences-to-transcript-entries';

describe('mapFirefliesSentencesToTranscriptEntries', () => {
  it('should map sentences to diarized entries with relative timestamps', () => {
    const entries = mapFirefliesSentencesToTranscriptEntries([
      {
        speaker_name: 'Sarah',
        text: 'Hi there, how are you?',
        start_time: 1.5,
        end_time: 3.2,
      },
      {
        speaker_name: 'John',
        text: 'Doing well, thanks.',
        start_time: 4,
        end_time: 5.5,
      },
    ]);

    expect(entries).toEqual([
      {
        participant: { name: 'Sarah' },
        words: [
          {
            text: 'Hi there, how are you?',
            start_timestamp: { relative: 1.5 },
            end_timestamp: { relative: 3.2 },
          },
        ],
      },
      {
        participant: { name: 'John' },
        words: [
          {
            text: 'Doing well, thanks.',
            start_timestamp: { relative: 4 },
            end_timestamp: { relative: 5.5 },
          },
        ],
      },
    ]);
  });

  it('should omit end_timestamp when end_time is missing so players span to the next entry', () => {
    const entries = mapFirefliesSentencesToTranscriptEntries([
      { speaker_name: 'Sarah', text: 'Hello.', start_time: 2 },
    ]);

    expect(entries[0].words[0]).toEqual({
      text: 'Hello.',
      start_timestamp: { relative: 2 },
    });
  });

  it('should omit timestamps when start_time is null', () => {
    const entries = mapFirefliesSentencesToTranscriptEntries([
      { speaker_name: 'Sarah', text: 'Hello.', start_time: null },
    ]);

    expect(entries[0].words[0]).toEqual({ text: 'Hello.' });
  });

  it('should label missing speakers and skip empty sentences', () => {
    const entries = mapFirefliesSentencesToTranscriptEntries([
      { speaker_name: null, text: 'Unattributed line.', start_time: 0 },
      { speaker_name: 'Sarah', text: '   ', start_time: 1 },
    ]);

    expect(entries).toHaveLength(1);
    expect(entries[0].participant.name).toBe('Speaker');
  });

  it('should return an empty array for null or undefined sentences', () => {
    expect(mapFirefliesSentencesToTranscriptEntries(null)).toEqual([]);
    expect(mapFirefliesSentencesToTranscriptEntries(undefined)).toEqual([]);
  });
});
