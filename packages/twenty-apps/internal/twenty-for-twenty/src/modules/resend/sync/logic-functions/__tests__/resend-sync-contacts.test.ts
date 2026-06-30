import { CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { resendSyncContactsHandler } from '@modules/resend/sync/logic-functions/resend-sync-contacts';

const mockSyncContacts = vi.fn();

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(),
}));

vi.mock('@modules/resend/shared/utils/get-resend-client', () => ({
  getResendClient: () => ({}),
}));

vi.mock('@modules/resend/sync/utils/sync-contacts', () => ({
  syncContacts: (...args: unknown[]) => mockSyncContacts(...args),
}));

describe('resendSyncContactsHandler', () => {
  beforeEach(() => {
    mockSyncContacts.mockReset();
    (CoreApiClient as unknown as ReturnType<typeof vi.fn>).mockReset();
  });

  it('invokes syncContacts with a deadline and reports an ok CONTACTS step', async () => {
    mockSyncContacts.mockResolvedValue({
      result: { fetched: 1, created: 1, updated: 0, errors: [] },
      value: undefined,
    });

    const summary = await resendSyncContactsHandler();

    expect(mockSyncContacts).toHaveBeenCalledTimes(1);
    const args = mockSyncContacts.mock.calls[0];

    expect(args[3]).toEqual({ deadlineAtMs: expect.any(Number) });
    expect(args[3].deadlineAtMs).toBeGreaterThan(Date.now());
    expect(summary.steps).toEqual([
      expect.objectContaining({ name: 'CONTACTS', status: 'ok', created: 1 }),
    ]);
  });
});
