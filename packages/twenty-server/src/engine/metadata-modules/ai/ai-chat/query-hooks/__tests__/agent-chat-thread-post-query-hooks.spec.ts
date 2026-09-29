import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { AgentChatThreadCreateManyPostQueryHook } from 'src/engine/metadata-modules/ai/ai-chat/query-hooks/agent-chat-thread-create-many.post-query.hook';
import { AgentChatThreadCreateOnePostQueryHook } from 'src/engine/metadata-modules/ai/ai-chat/query-hooks/agent-chat-thread-create-one.post-query.hook';
import { AgentChatThreadDestroyManyPostQueryHook } from 'src/engine/metadata-modules/ai/ai-chat/query-hooks/agent-chat-thread-destroy-many.post-query.hook';
import { AgentChatThreadDestroyOnePostQueryHook } from 'src/engine/metadata-modules/ai/ai-chat/query-hooks/agent-chat-thread-destroy-one.post-query.hook';
import { AgentChatThreadUpdateManyPostQueryHook } from 'src/engine/metadata-modules/ai/ai-chat/query-hooks/agent-chat-thread-update-many.post-query.hook';
import { AgentChatThreadUpdateOnePostQueryHook } from 'src/engine/metadata-modules/ai/ai-chat/query-hooks/agent-chat-thread-update-one.post-query.hook';

const WORKSPACE_ID = 'workspace-id';

const authContext = {
  type: 'user',
  workspace: { id: WORKSPACE_ID },
} as unknown as WorkspaceAuthContext;

const buildLifecycleService = () => ({
  assignCreatedThreadsToCreator: jest.fn().mockResolvedValue(undefined),
  stopArchivedThreads: jest.fn().mockResolvedValue(undefined),
  cleanUpDestroyedThreads: jest.fn().mockResolvedValue(undefined),
});

const payload = [{ id: 'first-thread' }, { id: 'second-thread' }];

describe('agentChatThread post query hooks', () => {
  it.each([
    ['createOne', AgentChatThreadCreateOnePostQueryHook],
    ['createMany', AgentChatThreadCreateManyPostQueryHook],
  ])(
    '%s makes the caller the owner of the created threads',
    async (_, Hook) => {
      const lifecycleService = buildLifecycleService();

      await new Hook(lifecycleService as never).execute(
        authContext,
        'agentChatThread',
        payload,
      );

      expect(
        lifecycleService.assignCreatedThreadsToCreator,
      ).toHaveBeenCalledWith({
        authContext,
        threadIds: ['first-thread', 'second-thread'],
      });
    },
  );

  it.each([
    ['updateOne', AgentChatThreadUpdateOnePostQueryHook],
    ['updateMany', AgentChatThreadUpdateManyPostQueryHook],
  ])('%s stops the updated threads that are now archived', async (_, Hook) => {
    const lifecycleService = buildLifecycleService();

    await new Hook(lifecycleService as never).execute(
      authContext,
      'agentChatThread',
      payload,
    );

    expect(lifecycleService.stopArchivedThreads).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      threadIds: ['first-thread', 'second-thread'],
    });
    expect(lifecycleService.cleanUpDestroyedThreads).not.toHaveBeenCalled();
  });

  it.each([
    ['destroyOne', AgentChatThreadDestroyOnePostQueryHook],
    ['destroyMany', AgentChatThreadDestroyManyPostQueryHook],
  ])('%s cleans up after the destroyed threads', async (_, Hook) => {
    const lifecycleService = buildLifecycleService();

    await new Hook(lifecycleService as never).execute(
      authContext,
      'agentChatThread',
      payload,
    );

    expect(lifecycleService.cleanUpDestroyedThreads).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      threadIds: ['first-thread', 'second-thread'],
    });
    expect(lifecycleService.stopArchivedThreads).not.toHaveBeenCalled();
  });
});
