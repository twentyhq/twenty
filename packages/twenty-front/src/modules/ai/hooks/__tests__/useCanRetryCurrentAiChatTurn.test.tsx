import { renderHook } from '@testing-library/react';
import { Provider } from 'jotai';
import { type ReactNode } from 'react';
import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatMessagesComponentFamilyState } from '@/ai/states/agentChatMessagesComponentFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { useCanRetryCurrentAiChatTurn } from '@/ai/hooks/useCanRetryCurrentAiChatTurn';
import { useCurrentAiChatThreadAccess } from '@/ai/hooks/useCurrentAiChatThreadAccess';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const wrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={jotaiStore}>
    <AgentChatComponentInstanceContext.Provider
      value={{ instanceId: 'sender-test' }}
    >
      {children}
    </AgentChatComponentInstanceContext.Provider>
  </Provider>
);

describe('Shared chat execution controls', () => {
  beforeEach(() => {
    resetJotaiStore();
    jotaiStore.set(agentChatDisplayedThreadState.atom, 'thread');
    jotaiStore.set(currentAiChatThreadState.atom, 'thread');
    jotaiStore.set(currentWorkspaceMemberState.atom, {
      id: 'bob-member',
      userWorkspaceId: 'bob',
    } as never);
  });

  it.each([
    [true, 'bob', true],
    [true, 'alice', false],
    [false, 'bob', false],
    [true, null, false],
  ])(
    'uses normal update permission (%s) and the saved sender (%s) for retries',
    (canUpdate, senderUserWorkspaceId, expected) => {
      const threads = [
        {
          id: 'thread',
          permissions: {
            canRead: true,
            canUpdate,
            canDelete: false,
            canSoftDelete: false,
          },
        },
      ];
      jotaiStore.set(metadataStoreState.atomFamily('agentChatThreads'), {
        current: threads,
        draft: threads,
        status: 'up-to-date',
      });
      jotaiStore.set(
        agentChatMessagesComponentFamilyState.atomFamily({
          instanceId: 'sender-test',
          familyKey: { threadId: 'thread' },
        }),
        [
          {
            id: 'message',
            role: 'user',
            parts: [],
            metadata: {
              createdAt: '2026-09-22T00:00:00.000Z',
              senderUserWorkspaceId,
            },
          },
          { id: 'assistant', role: 'assistant', parts: [] },
          {
            id: 'queued',
            role: 'user',
            status: 'queued',
            parts: [],
            metadata: {
              createdAt: '2026-09-22T00:00:00.000Z',
              senderUserWorkspaceId: 'alice',
            },
          },
        ],
      );
      const { result } = renderHook(
        () => ({
          canRetry: useCanRetryCurrentAiChatTurn(),
          access: useCurrentAiChatThreadAccess(),
        }),
        { wrapper },
      );
      expect(result.current).toEqual({
        canRetry: expected,
        access: canUpdate ? 'writer' : 'viewer',
      });
    },
  );
});
