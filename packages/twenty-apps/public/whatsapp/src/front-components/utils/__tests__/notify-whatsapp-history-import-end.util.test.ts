import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type WhatsappHistoryImportState } from 'src/types/whatsapp-history-import-state.type';

const mocks = vi.hoisted(() => ({ enqueueSnackbar: vi.fn() }));

vi.mock('twenty-sdk/front-component', () => ({
  enqueueSnackbar: mocks.enqueueSnackbar,
  t: (message: string, values: Record<string, unknown> = {}) =>
    message.replace(/\{(\w+)\}/g, (_, key) => String(values[key])),
}));

const { notifyWhatsappHistoryImportEnd } =
  await import('src/front-components/utils/notify-whatsapp-history-import-end.util');

const buildHistoryImport = (
  overrides: Partial<WhatsappHistoryImportState>,
): WhatsappHistoryImportState => ({
  runId: 'run-1',
  importPolicy: 'ALL',
  conversationLimit: 20,
  status: 'IMPORTING',
  importedConversationCount: 0,
  processedConversationCount: 0,
  startedAt: '2026-10-30T00:00:00.000Z',
  ...overrides,
});

describe('notifyWhatsappHistoryImportEnd', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('announces the number of conversations a finished run imported', () => {
    notifyWhatsappHistoryImportEnd({
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
    notifyWhatsappHistoryImportEnd({
      previous: buildHistoryImport({}),
      next: buildHistoryImport({
        status: 'FAILED',
        error: { code: 'UNREACHABLE', message: 'fetch failed' },
      }),
    });

    expect(mocks.enqueueSnackbar).toHaveBeenCalledExactlyOnceWith({
      message:
        'WhatsApp import failed. WhatsApp could not be reached. Retry in a few minutes.',
      variant: 'error',
    });
  });

  it('stays quiet for a run it never saw going', () => {
    notifyWhatsappHistoryImportEnd({
      previous: null,
      next: buildHistoryImport({ status: 'COMPLETED' }),
    });
    notifyWhatsappHistoryImportEnd({
      previous: buildHistoryImport({ runId: 'run-0' }),
      next: buildHistoryImport({ status: 'COMPLETED' }),
    });

    expect(mocks.enqueueSnackbar).not.toHaveBeenCalled();
  });
});
