import { type QueryRunner } from 'typeorm';

import { assertNoAgentChatThreadTargets } from 'src/database/commands/agent-history/utils/assert-no-agent-chat-thread-targets.util';

const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';

describe('Agent history rollback with record links', () => {
  const query = jest.fn();
  const runner = { query } as unknown as QueryRunner;
  beforeEach(() => query.mockReset());

  it('supports older workspaces without a thread-target table', async () => {
    query.mockResolvedValueOnce([{ exists: false }]);
    await expect(
      assertNoAgentChatThreadTargets(runner, WORKSPACE_ID),
    ).resolves.toBeUndefined();
    expect(query).toHaveBeenCalledTimes(1);
  });
  it('allows rollback after record links have been detached', async () => {
    query.mockResolvedValueOnce([{ exists: true }]).mockResolvedValueOnce([]);
    await expect(
      assertNoAgentChatThreadTargets(runner, WORKSPACE_ID),
    ).resolves.toBeUndefined();
  });
  it('blocks rollback that would discard live record links', async () => {
    query
      .mockResolvedValueOnce([{ exists: true }])
      .mockResolvedValueOnce([{ id: 'target' }]);
    await expect(
      assertNoAgentChatThreadTargets(runner, WORKSPACE_ID),
    ).rejects.toThrow('Detach record links');
  });
});
