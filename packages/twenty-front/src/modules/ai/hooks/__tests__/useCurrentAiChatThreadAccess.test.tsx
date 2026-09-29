import { renderHook } from '@testing-library/react';
import { Provider } from 'jotai';
import { type ReactNode } from 'react';

import { useCurrentAiChatThreadAccess } from '@/ai/hooks/useCurrentAiChatThreadAccess';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { threadIdCreatedFromDraftState } from '@/ai/states/threadIdCreatedFromDraftState';
import { setAgentChatThreadPermissions } from '@/ai/testing/setAgentChatThreadPermissions';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const wrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={jotaiStore}>{children}</Provider>
);

describe('useCurrentAiChatThreadAccess', () => {
  beforeEach(() => {
    resetJotaiStore();
    jotaiStore.set(currentAiChatThreadState.atom, 'thread');
  });

  it.each([
    {
      description:
        'lets the author write in the thread their draft just created while its permissions load',
      threadIdCreatedFromDraft: 'thread',
      permissions: undefined,
      expectedAccess: 'writer',
    },
    {
      description: 'keeps any other thread loading until its permissions load',
      threadIdCreatedFromDraft: 'another-thread',
      permissions: undefined,
      expectedAccess: 'loading',
    },
    {
      description:
        'follows the loaded permissions of the thread the draft created',
      threadIdCreatedFromDraft: 'thread',
      permissions: {
        canRead: true,
        canUpdate: false,
        canDelete: false,
        canSoftDelete: false,
      },
      expectedAccess: 'viewer',
    },
  ])(
    '$description',
    ({ threadIdCreatedFromDraft, permissions, expectedAccess }) => {
      jotaiStore.set(
        threadIdCreatedFromDraftState.atom,
        threadIdCreatedFromDraft,
      );
      setAgentChatThreadPermissions(jotaiStore, 'thread', permissions);

      const { result } = renderHook(() => useCurrentAiChatThreadAccess(), {
        wrapper,
      });

      expect(result.current).toBe(expectedAccess);
    },
  );
});
