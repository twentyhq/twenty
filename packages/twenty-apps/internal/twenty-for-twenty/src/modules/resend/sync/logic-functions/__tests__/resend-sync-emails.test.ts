import { CoreApiClient } from 'twenty-client-sdk/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { INTERMEDIATE_SYNC_EMAILS_MAX_AGE_MS } from '@modules/resend/constants/sync-config';
import { resendSyncEmailsHandler } from '@modules/resend/sync/logic-functions/resend-sync-emails';

const mockSyncEmails = vi.fn();

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(),
}));

vi.mock('@modules/resend/shared/utils/get-resend-client', () => ({
  getResendClient: () => ({}),
}));

vi.mock('@modules/resend/sync/utils/set-initial-sync-mode', () => ({
  isInitialSyncModeOn: async () => process.env.INITIAL_SYNC_MODE === 'true',
  setInitialSyncMode: vi.fn(),
}));

vi.mock('@modules/resend/sync/utils/sync-emails', () => ({
  syncEmails: (...args: unknown[]) => mockSyncEmails(...args),
}));

describe('resendSyncEmailsHandler', () => {
  const originalMode = process.env.INITIAL_SYNC_MODE;

  beforeEach(() => {
    mockSyncEmails.mockReset();
    mockSyncEmails.mockResolvedValue({
      result: { fetched: 0, created: 0, updated: 0, errors: [] },
      value: undefined,
    });
    (CoreApiClient as unknown as ReturnType<typeof vi.fn>).mockReset();
  });

  afterEach(() => {
    if (originalMode === undefined) {
      delete process.env.INITIAL_SYNC_MODE;
    } else {
      process.env.INITIAL_SYNC_MODE = originalMode;
    }
  });

  it('runs a full resumable sync in initial mode and forwards a deadline', async () => {
    process.env.INITIAL_SYNC_MODE = 'true';

    await resendSyncEmailsHandler();

    expect(mockSyncEmails).toHaveBeenCalledTimes(1);
    const args = mockSyncEmails.mock.calls[0];

    expect(args).toHaveLength(4);
    expect(args[3]).toEqual({ deadlineAtMs: expect.any(Number) });
    expect(args[3].deadlineAtMs).toBeGreaterThan(Date.now());
  });

  it('runs a 7-day non-resumable sync in intermediate mode and forwards a deadline', async () => {
    process.env.INITIAL_SYNC_MODE = 'false';

    await resendSyncEmailsHandler();

    expect(mockSyncEmails).toHaveBeenCalledTimes(1);
    const args = mockSyncEmails.mock.calls[0];

    expect(args[3]).toEqual({
      stopBeforeCreatedAtMs: INTERMEDIATE_SYNC_EMAILS_MAX_AGE_MS,
      resumable: false,
      deadlineAtMs: expect.any(Number),
    });
    expect(args[3].deadlineAtMs).toBeGreaterThan(Date.now());
  });
});
