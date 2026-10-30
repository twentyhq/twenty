import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  listMessageChannels: vi.fn(),
  kvStore: new Map<string, unknown>(),
}));

vi.mock('twenty-sdk/logic-function', () => ({
  listMessageChannels: mocks.listMessageChannels,
  kv: { get: async (key: string) => mocks.kvStore.get(key) ?? null },
}));

const { buildLinkedinSettingsView } =
  await import('src/logic-functions/utils/build-linkedin-settings-view.util');

const CONNECTION = {
  id: 'connection-id',
  name: 'Ada Lovelace',
  handle: 'https://www.linkedin.com/in/ada',
  authFailedAt: null,
} as never;

const setRunningImport = (updatedAt: string) =>
  mocks.kvStore.set('linkedin-history-import:connection-id', {
    runId: 'run-1',
    importPolicy: 'ALL',
    status: 'IMPORTING',
    importedConversationCount: 3,
    processedConversationCount: 3,
    startedAt: updatedAt,
    updatedAt,
  });

describe('buildLinkedinSettingsView', () => {
  beforeEach(() => {
    mocks.kvStore.clear();
    mocks.listMessageChannels.mockResolvedValue([
      { id: 'channel-id', visibility: 'METADATA' },
    ]);
  });

  it('shows a run that is making progress as importing', async () => {
    setRunningImport(new Date().toISOString());

    await expect(buildLinkedinSettingsView(CONNECTION)).resolves.toEqual(
      expect.objectContaining({
        historyImport: expect.objectContaining({ status: 'IMPORTING' }),
      }),
    );
  });

  it('shows a run whose jobs stopped as failed so it can be retried', async () => {
    setRunningImport('2026-10-01T00:00:00.000Z');

    await expect(buildLinkedinSettingsView(CONNECTION)).resolves.toEqual(
      expect.objectContaining({
        historyImport: expect.objectContaining({
          status: 'FAILED',
          error: expect.objectContaining({ code: 'STALLED' }),
        }),
      }),
    );
  });
});
