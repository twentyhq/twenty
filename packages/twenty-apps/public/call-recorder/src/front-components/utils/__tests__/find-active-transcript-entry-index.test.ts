import { describe, expect, it } from 'vitest';

import { type TranscriptEntry } from 'src/front-components/types/transcript-entry.type';
import { findActiveTranscriptEntryIndex } from 'src/front-components/utils/find-active-transcript-entry-index.util';

const makeTranscriptEntry = ({
  startSeconds,
  endSeconds,
}: {
  startSeconds: number | undefined;
  endSeconds: number | undefined;
}): TranscriptEntry => ({
  speakerName: 'Ada Lovelace',
  startSeconds,
  endSeconds,
  text: 'Hello',
  words: [{ text: 'Hello', startSeconds, endSeconds }],
});

describe('findActiveTranscriptEntryIndex', () => {
  it('does not keep an open-ended entry active after the next entry starts', () => {
    expect(
      findActiveTranscriptEntryIndex(
        [
          makeTranscriptEntry({ startSeconds: 1, endSeconds: undefined }),
          makeTranscriptEntry({ startSeconds: 10, endSeconds: 20 }),
        ],
        25,
      ),
    ).toBe(-1);
  });

  it('uses the next known start as the boundary for entries without an end time', () => {
    expect(
      findActiveTranscriptEntryIndex(
        [
          makeTranscriptEntry({ startSeconds: 1, endSeconds: undefined }),
          makeTranscriptEntry({ startSeconds: 10, endSeconds: 20 }),
        ],
        9,
      ),
    ).toBe(0);

    expect(
      findActiveTranscriptEntryIndex(
        [
          makeTranscriptEntry({ startSeconds: 1, endSeconds: undefined }),
          makeTranscriptEntry({ startSeconds: 10, endSeconds: 20 }),
        ],
        10,
      ),
    ).toBe(1);
  });

  it('keeps the final open-ended entry active after it starts', () => {
    expect(
      findActiveTranscriptEntryIndex(
        [
          makeTranscriptEntry({ startSeconds: 1, endSeconds: 2 }),
          makeTranscriptEntry({ startSeconds: 10, endSeconds: undefined }),
        ],
        25,
      ),
    ).toBe(1);
  });
});
