import { render, screen } from '@testing-library/react';
import { type CallRecordingParsedTranscriptEntry } from 'twenty-shared/types';

import { CallRecordingTranscriptEntryList } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptEntryList';

const makeTranscriptEntry = (
  overrides: Partial<CallRecordingParsedTranscriptEntry>,
): CallRecordingParsedTranscriptEntry => ({
  speakerName: undefined,
  startSeconds: 12,
  endSeconds: 21,
  text: 'Hello there.',
  words: [],
  ...overrides,
});

describe('CallRecordingTranscriptEntryList', () => {
  it('shows each entry with its timestamp and no speaker when no entry has a speaker', () => {
    render(
      <CallRecordingTranscriptEntryList
        entries={[
          makeTranscriptEntry({}),
          makeTranscriptEntry({ startSeconds: 24, text: 'Pipeline grew.' }),
        ]}
      />,
    );

    expect(screen.getByText('Hello there.')).toBeVisible();
    expect(screen.getByText('0:24')).toBeVisible();
    expect(screen.queryByText('Unknown speaker')).not.toBeInTheDocument();
  });

  it('marks entries without a speaker as unknown when other entries have one', () => {
    render(
      <CallRecordingTranscriptEntryList
        entries={[
          makeTranscriptEntry({ speakerName: 'Ada Lovelace' }),
          makeTranscriptEntry({ startSeconds: 24, text: 'Pipeline grew.' }),
        ]}
      />,
    );

    expect(screen.getByText('Ada Lovelace')).toBeVisible();
    expect(screen.getByText('Unknown speaker')).toBeVisible();
    expect(screen.getByText('0:24')).toBeVisible();
  });
});
