import { beforeEach, describe, expect, it, vi } from 'vitest';

import { readTeamsDirectoryMatchRunOutcome } from 'src/features/chat/logic-functions/utils/read-teams-directory-match-run-outcome';

const { kvGetMock } = vi.hoisted(() => ({ kvGetMock: vi.fn() }));

vi.mock('twenty-sdk/logic-function', () => ({
  kv: { get: kvGetMock },
}));

describe('readTeamsDirectoryMatchRunOutcome', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the stored outcome', async () => {
    kvGetMock.mockResolvedValue({ isSuccessful: false, errorMessage: 'boom' });

    expect(await readTeamsDirectoryMatchRunOutcome()).toEqual({
      isSuccessful: false,
      errorMessage: 'boom',
    });
    expect(kvGetMock).toHaveBeenCalledWith('teams-directory-match-run-outcome');
  });

  it('ignores a missing or malformed entry', async () => {
    kvGetMock.mockResolvedValueOnce(null);
    expect(await readTeamsDirectoryMatchRunOutcome()).toBeUndefined();

    kvGetMock.mockResolvedValueOnce({ isSuccessful: 'yes' });
    expect(await readTeamsDirectoryMatchRunOutcome()).toBeUndefined();
  });

  it('treats a key-value read failure as no outcome', async () => {
    kvGetMock.mockRejectedValue(new Error('kv down'));

    expect(await readTeamsDirectoryMatchRunOutcome()).toBeUndefined();
  });
});
