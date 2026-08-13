import { findActiveCallRecordingTranscriptEntryIndex } from '@/page-layout/widgets/call-recording-transcript/utils/findActiveCallRecordingTranscriptEntryIndex';
import { type CallRecordingParsedTranscriptEntry } from 'twenty-shared/types';

const makeTranscriptEntry = ({
  startSeconds,
  endSeconds,
}: {
  startSeconds: number | undefined;
  endSeconds: number | undefined;
}): CallRecordingParsedTranscriptEntry => ({
  speakerName: 'Ada Lovelace',
  startSeconds,
  endSeconds,
  text: 'Hello',
  words: [{ text: 'Hello', startSeconds, endSeconds }],
});

describe('findActiveCallRecordingTranscriptEntryIndex', () => {
  it('does not keep an open-ended entry active after the next entry starts', () => {
    expect(
      findActiveCallRecordingTranscriptEntryIndex({
        entries: [
          makeTranscriptEntry({ startSeconds: 1, endSeconds: undefined }),
          makeTranscriptEntry({ startSeconds: 10, endSeconds: 20 }),
        ],
        currentTimeSeconds: 25,
      }),
    ).toBe(-1);
  });

  it('uses the next known start as the boundary for entries without an end time', () => {
    expect(
      findActiveCallRecordingTranscriptEntryIndex({
        entries: [
          makeTranscriptEntry({ startSeconds: 1, endSeconds: undefined }),
          makeTranscriptEntry({ startSeconds: 10, endSeconds: 20 }),
        ],
        currentTimeSeconds: 9,
      }),
    ).toBe(0);

    expect(
      findActiveCallRecordingTranscriptEntryIndex({
        entries: [
          makeTranscriptEntry({ startSeconds: 1, endSeconds: undefined }),
          makeTranscriptEntry({ startSeconds: 10, endSeconds: 20 }),
        ],
        currentTimeSeconds: 10,
      }),
    ).toBe(1);
  });

  it('keeps the final open-ended entry active after it starts', () => {
    expect(
      findActiveCallRecordingTranscriptEntryIndex({
        entries: [
          makeTranscriptEntry({ startSeconds: 1, endSeconds: 2 }),
          makeTranscriptEntry({ startSeconds: 10, endSeconds: undefined }),
        ],
        currentTimeSeconds: 25,
      }),
    ).toBe(1);
  });
});
