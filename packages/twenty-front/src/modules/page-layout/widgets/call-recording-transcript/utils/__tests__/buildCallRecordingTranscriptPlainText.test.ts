import { buildCallRecordingTranscriptPlainText } from '@/page-layout/widgets/call-recording-transcript/utils/buildCallRecordingTranscriptPlainText';
import { type CallRecordingParsedTranscriptEntry } from 'twenty-shared/types';

const makeTranscriptEntry = (
  overrides: Partial<CallRecordingParsedTranscriptEntry>,
): CallRecordingParsedTranscriptEntry => ({
  speakerName: 'Ada Lovelace',
  startSeconds: 12,
  endSeconds: 21,
  text: 'Hello there.',
  words: [],
  ...overrides,
});

describe('buildCallRecordingTranscriptPlainText', () => {
  it('renders speaker, timestamp and text per entry separated by blank lines', () => {
    expect(
      buildCallRecordingTranscriptPlainText([
        makeTranscriptEntry({}),
        makeTranscriptEntry({
          speakerName: 'Grace Hopper',
          startSeconds: 3675,
          text: 'Pipeline grew.',
        }),
      ]),
    ).toBe(
      'Ada Lovelace (0:12)\nHello there.\n\nGrace Hopper (1:01:15)\nPipeline grew.',
    );
  });

  it('falls back to an unknown speaker when only some entries have one, and omits missing timestamps', () => {
    expect(
      buildCallRecordingTranscriptPlainText([
        makeTranscriptEntry({}),
        makeTranscriptEntry({
          speakerName: undefined,
          startSeconds: undefined,
          text: 'Inaudible segment.',
        }),
      ]),
    ).toBe(
      'Ada Lovelace (0:12)\nHello there.\n\nUnknown speaker\nInaudible segment.',
    );
  });

  it('leaves out speakers but keeps timestamps when no entry has a speaker', () => {
    expect(
      buildCallRecordingTranscriptPlainText([
        makeTranscriptEntry({ speakerName: undefined }),
        makeTranscriptEntry({
          speakerName: undefined,
          startSeconds: 3675,
          text: 'Pipeline grew.',
        }),
        makeTranscriptEntry({
          speakerName: undefined,
          startSeconds: undefined,
          text: 'Inaudible segment.',
        }),
      ]),
    ).toBe(
      '0:12\nHello there.\n\n1:01:15\nPipeline grew.\n\nInaudible segment.',
    );
  });
});
