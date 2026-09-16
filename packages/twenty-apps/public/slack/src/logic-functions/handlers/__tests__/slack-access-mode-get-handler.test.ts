import { beforeEach, describe, expect, it, vi } from 'vitest';

import { slackAccessModeGetHandler } from 'src/logic-functions/handlers/slack-access-mode-get-handler';

const { readSlackAccessModeMock } = vi.hoisted(() => ({
  readSlackAccessModeMock: vi.fn(),
}));

vi.mock('src/logic-functions/utils/read-slack-access-mode', () => ({
  readSlackAccessMode: readSlackAccessModeMock,
}));

describe('slackAccessModeGetHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return the stored access mode as readable', async () => {
    readSlackAccessModeMock.mockResolvedValue({
      status: 'READ',
      accessMode: 'ONLY_LINKED_MEMBERS',
    });

    expect(await slackAccessModeGetHandler()).toEqual({
      accessMode: 'ONLY_LINKED_MEMBERS',
      isAccessModeReadable: true,
    });
  });

  it('should report an unreadable store rather than passing the fallback off as stored', async () => {
    readSlackAccessModeMock.mockResolvedValue({ status: 'UNREADABLE' });

    expect(await slackAccessModeGetHandler()).toEqual({
      accessMode: 'ONLY_LINKED_MEMBERS',
      isAccessModeReadable: false,
    });
  });
});
