import { describe, expect, it } from 'vitest';

import { parseTranscriptEntries } from 'src/front-components/utils/parse-transcript-entries.util';

describe('parseTranscriptEntries', () => {
  it('should parse a diarized entry with speaker and relative timestamps', () => {
    expect(
      parseTranscriptEntries([
        {
          participant: { name: 'Sarah' },
          words: [
            {
              text: 'Hello',
              start_timestamp: { relative: 1.5 },
              end_timestamp: { relative: 2 },
            },
          ],
        },
      ]),
    ).toEqual([
      {
        speakerName: 'Sarah',
        startSeconds: 1.5,
        endSeconds: 2,
        text: 'Hello',
        words: [{ text: 'Hello', startSeconds: 1.5, endSeconds: 2 }],
      },
    ]);
  });

  it('should fall back to "Unknown speaker" for a whitespace-only name', () => {
    const entries = parseTranscriptEntries([
      { participant: { name: '   ' }, words: [{ text: 'Hi' }] },
    ]);

    expect(entries?.[0]?.speakerName).toBe('Unknown speaker');
  });

  it('should drop entries whose words are all whitespace', () => {
    expect(
      parseTranscriptEntries([
        { participant: { name: 'Sarah' }, words: [{ text: '   ' }] },
      ]),
    ).toEqual([]);
  });

  it('should return undefined for a non-array transcript', () => {
    expect(parseTranscriptEntries({})).toBeUndefined();
  });
});
