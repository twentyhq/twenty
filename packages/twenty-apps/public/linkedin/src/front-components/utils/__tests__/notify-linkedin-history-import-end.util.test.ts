import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';

const mocks = vi.hoisted(() => ({ enqueueSnackbar: vi.fn() }));

vi.mock('twenty-sdk/front-component', () => ({
  enqueueSnackbar: mocks.enqueueSnackbar,
  t: (message: string, values: Record<string, unknown> = {}) =>
    message.replace(/\{(\w+)\}/g, (_, key) => String(values[key])),
}));

const { notifyLinkedinHistoryImportEnd } =
  await import('src/front-components/utils/notify-linkedin-history-import-end.util');

const buildHistoryImport = (
  overrides: Partial<LinkedinHistoryImportState>,
): LinkedinHistoryImportState => ({
  runId: 'run-1',
  importPolicy: 'ALL',
  status: 'IMPORTING',
  importedConversationCount: 0,
  processedConversationCount: 0,
  startedAt: '2026-10-30T00:00:00.000Z',
  ...overrides,
});

describe('notifyLinkedinHistoryImportEnd', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('announces the number of conversations a finished run imported', () => {
    notifyLinkedinHistoryImportEnd({
      previous: buildHistoryImport({}),
      next: buildHistoryImport({
        status: 'COMPLETED',
        importedConversationCount: 1180,
      }),
    });

    expect(mocks.enqueueSnackbar).toHaveBeenCalledExactlyOnceWith({
      message: '1180 past conversations imported',
      variant: 'success',
    });
  });

  it('explains why a run failed', () => {
    notifyLinkedinHistoryImportEnd({
      previous: buildHistoryImport({}),
      next: buildHistoryImport({
        status: 'FAILED',
        error: { code: 'UNREACHABLE', message: 'fetch failed' },
      }),
    });

    expect(mocks.enqueueSnackbar).toHaveBeenCalledExactlyOnceWith({
      message:
        'LinkedIn import failed. LinkedIn could not be reached. Retry in a few minutes.',
      variant: 'error',
    });
  });

  it('stays quiet for a run it never saw going', () => {
    notifyLinkedinHistoryImportEnd({
      previous: null,
      next: buildHistoryImport({ status: 'COMPLETED' }),
    });
    notifyLinkedinHistoryImportEnd({
      previous: buildHistoryImport({ runId: 'run-0' }),
      next: buildHistoryImport({ status: 'COMPLETED' }),
    });

    expect(mocks.enqueueSnackbar).not.toHaveBeenCalled();
  });
});
