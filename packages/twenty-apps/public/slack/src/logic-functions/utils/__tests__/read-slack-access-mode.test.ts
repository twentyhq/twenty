import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getSlackAccessMode } from 'src/logic-functions/utils/get-slack-access-mode';
import { readSlackAccessMode } from 'src/logic-functions/utils/read-slack-access-mode';

const { kvGetMock } = vi.hoisted(() => ({
  kvGetMock: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', () => ({
  kv: { get: kvGetMock },
}));

describe('readSlackAccessMode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should read as ANYONE when nothing is stored', async () => {
    kvGetMock.mockResolvedValue(null);

    expect(await readSlackAccessMode()).toEqual({
      status: 'READ',
      accessMode: 'ANYONE',
    });
  });

  it('should report the read outcome alongside a stored value', async () => {
    kvGetMock.mockResolvedValue('ONLY_LINKED_MEMBERS');

    expect(await readSlackAccessMode()).toEqual({
      status: 'READ',
      accessMode: 'ONLY_LINKED_MEMBERS',
    });
  });

  it('should report an unreadable store distinctly from a stored value', async () => {
    kvGetMock.mockRejectedValue(new Error('kv unavailable'));

    expect(await readSlackAccessMode()).toEqual({ status: 'UNREADABLE' });
  });

  it('should report a stored value it cannot interpret as unreadable', async () => {
    kvGetMock.mockResolvedValue('SOMETHING_ELSE');

    expect(await readSlackAccessMode()).toEqual({ status: 'UNREADABLE' });
  });
});

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

  it('should keep the restriction on when the read throws', async () => {
    kvGetMock.mockRejectedValue(new Error('kv unavailable'));

    expect(await getSlackAccessMode()).toBe('ONLY_LINKED_MEMBERS');
  });

  it('should keep the restriction on for a stored value it cannot interpret', async () => {
    kvGetMock.mockResolvedValue('SOMETHING_ELSE');

    expect(await getSlackAccessMode()).toBe('ONLY_LINKED_MEMBERS');
  });
});
