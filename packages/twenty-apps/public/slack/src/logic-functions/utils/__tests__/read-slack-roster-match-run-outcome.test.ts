import { beforeEach, describe, expect, it, vi } from 'vitest';

import { readSlackRosterMatchRunOutcome } from 'src/logic-functions/utils/read-slack-roster-match-run-outcome';

const { kvGetMock } = vi.hoisted(() => ({ kvGetMock: vi.fn() }));

vi.mock('twenty-sdk/logic-function', () => ({
  kv: { get: kvGetMock },
}));

describe('readSlackRosterMatchRunOutcome', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should read a stored failure with its error message', async () => {
    kvGetMock.mockResolvedValue({
      isSuccessful: false,
      errorMessage: 'kaboom',
    });

    await expect(readSlackRosterMatchRunOutcome()).resolves.toEqual({
      isSuccessful: false,
      errorMessage: 'kaboom',
    });
  });

  it('should read a stored success', async () => {
    kvGetMock.mockResolvedValue({ isSuccessful: true });

    await expect(readSlackRosterMatchRunOutcome()).resolves.toEqual({
      isSuccessful: true,
      errorMessage: undefined,
    });
  });

  it('should return undefined when nothing was recorded', async () => {
    kvGetMock.mockResolvedValue(null);

    await expect(readSlackRosterMatchRunOutcome()).resolves.toBeUndefined();
  });

  it('should return undefined for a malformed record', async () => {
    kvGetMock.mockResolvedValue({ isSuccessful: 'yes' });

    await expect(readSlackRosterMatchRunOutcome()).resolves.toBeUndefined();
  });

  it('should return undefined when the read fails', async () => {
    kvGetMock.mockRejectedValue(new Error('kv unavailable'));

    await expect(readSlackRosterMatchRunOutcome()).resolves.toBeUndefined();
  });
});
