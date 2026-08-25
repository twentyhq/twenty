import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getSlackAccessMode } from 'src/logic-functions/utils/get-slack-access-mode';

const { kvGetMock } = vi.hoisted(() => ({
  kvGetMock: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', () => ({
  kv: { get: kvGetMock },
}));

describe('getSlackAccessMode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should default to ANYONE when nothing is stored', async () => {
    kvGetMock.mockResolvedValue(null);

    expect(await getSlackAccessMode()).toBe('ANYONE');
  });

  it('should return ONLY_LINKED_MEMBERS when stored', async () => {
    kvGetMock.mockResolvedValue('ONLY_LINKED_MEMBERS');

    expect(await getSlackAccessMode()).toBe('ONLY_LINKED_MEMBERS');
  });

  it('should fall back to ANYONE for an unexpected stored value', async () => {
    kvGetMock.mockResolvedValue('SOMETHING_ELSE');

    expect(await getSlackAccessMode()).toBe('ANYONE');
  });

  it('should fall back to ANYONE when the read throws', async () => {
    kvGetMock.mockRejectedValue(new Error('kv unavailable'));

    expect(await getSlackAccessMode()).toBe('ANYONE');
  });
});
