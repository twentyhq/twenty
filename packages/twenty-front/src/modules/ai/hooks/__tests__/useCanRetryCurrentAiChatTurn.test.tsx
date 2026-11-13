import { setAiChatThreadPermissions } from '@/ai/testing/setAiChatThreadPermissions';
import { renderHook } from '@testing-library/react';
import { Provider } from 'jotai';
import { type ReactNode } from 'react';
import { aiChatDisplayedThreadState } from '@/ai/states/aiChatDisplayedThreadState';
import { aiChatMessagesFamilyState } from '@/ai/states/aiChatMessagesFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useCanRetryCurrentAiChatTurn } from '@/ai/hooks/useCanRetryCurrentAiChatTurn';
import { useCurrentAiChatThreadAccess } from '@/ai/hooks/useCurrentAiChatThreadAccess';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const wrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={jotaiStore}>{children}</Provider>
);

describe('Shared chat execution controls', () => {
  beforeEach(() => {
    resetJotaiStore();
    jotaiStore.set(aiChatDisplayedThreadState.atom, 'thread');
    jotaiStore.set(currentAiChatThreadState.atom, 'thread');
    jotaiStore.set(currentWorkspaceMemberState.atom, {
      id: 'bob',
    } as never);
  });

  it.each([
    [true, 'bob', true],
    [true, 'alice', false],
    [false, 'bob', false],
    [true, null, false],
  ])(
    'uses normal update permission (%s) and the saved sender (%s) for retries',
    (canUpdate, senderWorkspaceMemberId, expected) => {
      setAiChatThreadPermissions({
        store: jotaiStore,
        threadId: 'thread',
        permissions: {
          canRead: true,
          canUpdate,
          canDelete: false,
          canSoftDelete: false,
        },
      });
      jotaiStore.set(
        aiChatMessagesFamilyState.atomFamily({ threadId: 'thread' }),
        [
          {
            id: 'message',
            role: 'user',
            parts: [],
            metadata: {
              createdAt: '2026-09-22T00:00:00.000Z',
              senderWorkspaceMemberId,
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
              senderWorkspaceMemberId: 'alice',
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
