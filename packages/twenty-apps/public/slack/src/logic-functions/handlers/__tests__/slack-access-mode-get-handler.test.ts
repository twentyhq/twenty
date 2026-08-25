import { beforeEach, describe, expect, it, vi } from 'vitest';

import { slackAccessModeGetHandler } from 'src/logic-functions/handlers/slack-access-mode-get-handler';

const { getSlackAccessModeMock } = vi.hoisted(() => ({
  getSlackAccessModeMock: vi.fn(),
}));

vi.mock('src/logic-functions/utils/get-slack-access-mode', () => ({
  getSlackAccessMode: getSlackAccessModeMock,
}));

describe('slackAccessModeGetHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return the current access mode', async () => {
    getSlackAccessModeMock.mockResolvedValue('ONLY_LINKED_MEMBERS');

    expect(await slackAccessModeGetHandler()).toEqual({
      accessMode: 'ONLY_LINKED_MEMBERS',
    });
  });
});
