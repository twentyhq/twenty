import { CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { resendSyncTemplatesHandler } from '@modules/resend/sync/logic-functions/resend-sync-templates';

const mockSyncTemplates = vi.fn();

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(),
}));

vi.mock('@modules/resend/shared/utils/get-resend-client', () => ({
  getResendClient: () => ({}),
}));

vi.mock('@modules/resend/sync/utils/sync-templates', () => ({
  syncTemplates: (...args: unknown[]) => mockSyncTemplates(...args),
}));

describe('resendSyncTemplatesHandler', () => {
  beforeEach(() => {
    mockSyncTemplates.mockReset();
    (CoreApiClient as unknown as ReturnType<typeof vi.fn>).mockReset();
  });

  it('reports an ok TEMPLATES step on success and forwards a deadline', async () => {
    mockSyncTemplates.mockResolvedValue({
      result: { fetched: 5, created: 2, updated: 3, errors: [] },
      value: undefined,
    });

    const summary = await resendSyncTemplatesHandler();

    expect(mockSyncTemplates).toHaveBeenCalledTimes(1);
    const args = mockSyncTemplates.mock.calls[0];

    expect(args[2]).toEqual({ deadlineAtMs: expect.any(Number) });
    expect(args[2].deadlineAtMs).toBeGreaterThan(Date.now());
    expect(summary.steps).toEqual([
      expect.objectContaining({
        name: 'TEMPLATES',
        status: 'ok',
        fetched: 5,
        created: 2,
        updated: 3,
      }),
    ]);
  });

  it('reports a failed TEMPLATES step when sync throws', async () => {
    mockSyncTemplates.mockRejectedValue(new Error('boom'));

    const summary = await resendSyncTemplatesHandler();

    expect(summary.steps).toEqual([
      expect.objectContaining({ name: 'TEMPLATES', status: 'failed' }),
    ]);
  });
});
