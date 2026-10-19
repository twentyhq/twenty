import { describe, expect, it } from 'vitest';

import { getTeamsCallSummariesSnackbar } from 'src/features/transcripts/front-components/utils/get-teams-call-summaries-snackbar';

const buildProcessedResult = ({
  summarized = 0,
  unavailable = 0,
  failed = 0,
  skipped = 0,
}: {
  summarized?: number;
  unavailable?: number;
  failed?: number;
  skipped?: number;
}) => ({
  outcome: 'processed' as const,
  summarizedCallRecordingIds: Array.from({ length: summarized }, String),
  unavailableCallRecordingIds: Array.from({ length: unavailable }, String),
  failedCallRecordingIds: Array.from({ length: failed }, String),
  skippedCallRecordingIds: Array.from({ length: skipped }, String),
});

describe('getTeamsCallSummariesSnackbar', () => {
  it('should confirm generated summaries', () => {
    expect(
      getTeamsCallSummariesSnackbar(buildProcessedResult({ summarized: 2 })),
    ).toEqual({ message: 'Summary generated.', variant: 'success' });
  });

  it('should report partial and complete failures', () => {
    expect(
      getTeamsCallSummariesSnackbar(
        buildProcessedResult({ summarized: 1, failed: 1 }),
      ),
    ).toEqual({
      message: 'Some summaries generated, some failed.',
      variant: 'error',
    });
    expect(
      getTeamsCallSummariesSnackbar(buildProcessedResult({ failed: 1 })),
    ).toEqual({ message: 'Summary generation failed.', variant: 'error' });
  });

  it('should not report success when some transcripts could not be summarized', () => {
    expect(
      getTeamsCallSummariesSnackbar(
        buildProcessedResult({ summarized: 1, unavailable: 1 }),
      ),
    ).toEqual({
      message:
        'Some summaries generated, some transcripts could not be summarized.',
      variant: 'error',
    });
  });

  it('should explain why nothing was summarized', () => {
    expect(getTeamsCallSummariesSnackbar({ outcome: 'disabled' })).toEqual({
      message: 'Call summaries are turned off for this workspace.',
      variant: 'error',
    });
    expect(
      getTeamsCallSummariesSnackbar({ outcome: 'no-teams-call-recordings' }),
    ).toEqual({
      message: 'No Microsoft Teams call recording found.',
      variant: 'error',
    });
    expect(
      getTeamsCallSummariesSnackbar({ outcome: 'too-many-call-recordings' }),
    ).toEqual({
      message: 'Select up to 20 calls at a time.',
      variant: 'error',
    });
    expect(
      getTeamsCallSummariesSnackbar(buildProcessedResult({ unavailable: 1 })),
    ).toEqual({
      message: 'The transcript could not be summarized.',
      variant: 'error',
    });
    expect(
      getTeamsCallSummariesSnackbar(buildProcessedResult({ skipped: 1 })),
    ).toEqual({ message: 'No usable transcript found.', variant: 'error' });
  });
});
