import { CoreApiClient } from 'twenty-client-sdk/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { resendInitialSyncModeMonitorHandler } from '@modules/resend/sync/logic-functions/resend-initial-sync-mode-monitor';

const mockSetInitialSyncMode = vi.fn();
const mockAreAllSyncCursorsEmpty = vi.fn();

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(),
}));

vi.mock('twenty-client-sdk/metadata', () => ({
  MetadataApiClient: vi.fn(),
}));

vi.mock('@modules/resend/sync/utils/set-initial-sync-mode', () => ({
  setInitialSyncMode: (...args: unknown[]) => mockSetInitialSyncMode(...args),
  isInitialSyncModeOn: async () => process.env.INITIAL_SYNC_MODE === 'true',
}));

vi.mock('@modules/resend/sync/utils/are-all-sync-cursors-empty', () => ({
  areAllSyncCursorsEmpty: (...args: unknown[]) =>
    mockAreAllSyncCursorsEmpty(...args),
}));

describe('resendInitialSyncModeMonitorHandler', () => {
  const originalEnv = process.env.INITIAL_SYNC_MODE;

  beforeEach(() => {
    mockSetInitialSyncMode.mockReset();
    mockAreAllSyncCursorsEmpty.mockReset();
    (CoreApiClient as unknown as ReturnType<typeof vi.fn>).mockReset();
  });

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.INITIAL_SYNC_MODE;
    } else {
      process.env.INITIAL_SYNC_MODE = originalEnv;
    }
  });

  it('skips when INITIAL_SYNC_MODE is off', async () => {
    process.env.INITIAL_SYNC_MODE = 'false';

    const result = await resendInitialSyncModeMonitorHandler();

    expect(result).toEqual({ skipped: true, flipped: false });
    expect(mockAreAllSyncCursorsEmpty).not.toHaveBeenCalled();
    expect(mockSetInitialSyncMode).not.toHaveBeenCalled();
  });

  it('does nothing when cursors are not all empty', async () => {
    process.env.INITIAL_SYNC_MODE = 'true';
    mockAreAllSyncCursorsEmpty.mockResolvedValue(false);

    const result = await resendInitialSyncModeMonitorHandler();

    expect(result).toEqual({ skipped: false, flipped: false });
    expect(mockSetInitialSyncMode).not.toHaveBeenCalled();
  });

  it('flips INITIAL_SYNC_MODE to false when all cursors are empty', async () => {
    process.env.INITIAL_SYNC_MODE = 'true';
    mockAreAllSyncCursorsEmpty.mockResolvedValue(true);

    const result = await resendInitialSyncModeMonitorHandler();

    expect(result).toEqual({ skipped: false, flipped: true });
    expect(mockSetInitialSyncMode).toHaveBeenCalledWith('false');
  });
});
