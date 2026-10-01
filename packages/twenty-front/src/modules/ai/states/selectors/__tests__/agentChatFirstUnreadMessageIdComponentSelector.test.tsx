import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatMessagesComponentFamilyState } from '@/ai/states/agentChatMessagesComponentFamilyState';
import {
  type AgentChatThreadUnreadSince,
  agentChatThreadUnreadSinceState,
} from '@/ai/states/agentChatThreadUnreadSinceState';
import { agentChatFirstUnreadMessageIdComponentSelector } from '@/ai/states/selectors/agentChatFirstUnreadMessageIdComponentSelector';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const INSTANCE_ID = 'agentChatFirstUnreadMessageIdTest';
const THREAD_ID = 'thread';
const ME = 'my-user-workspace-id';
const TEAMMATE = 'teammate-user-workspace-id';

const buildMessage = (
  id: string,
  role: 'user' | 'assistant',
  createdAt: string,
  senderUserWorkspaceId?: string,
) => ({
  id,
  role,
  parts: [],
  metadata: { createdAt, senderUserWorkspaceId },
});

const MESSAGES = [
  buildMessage('read', 'user', '2026-10-01T10:00:00.000Z', TEAMMATE),
  buildMessage('mine', 'user', '2026-10-01T10:05:00.000Z', ME),
  buildMessage('teammate', 'user', '2026-10-01T10:07:00.000Z', TEAMMATE),
  buildMessage('reply', 'assistant', '2026-10-01T10:08:00.000Z'),
];

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <AgentChatComponentInstanceContext.Provider
      value={{ instanceId: INSTANCE_ID }}
    >
      {children}
    </AgentChatComponentInstanceContext.Provider>
  </JotaiProvider>
);

const getFirstUnreadMessageId = (
  unreadSince: AgentChatThreadUnreadSince | null,
  messages = MESSAGES,
) => {
  jotaiStore.set(agentChatThreadUnreadSinceState.atom, unreadSince);
  jotaiStore.set(
    agentChatMessagesComponentFamilyState.atomFamily({
      instanceId: INSTANCE_ID,
      familyKey: { threadId: THREAD_ID },
    }),
    messages,
  );

  return renderHook(
    () =>
      useAtomComponentSelectorValue(
        agentChatFirstUnreadMessageIdComponentSelector,
      ),
    { wrapper: Wrapper },
  ).result.current;
};

describe('agentChatFirstUnreadMessageIdComponentSelector', () => {
  beforeEach(() => {
    resetJotaiStore();
    jotaiStore.set(agentChatDisplayedThreadState.atom, THREAD_ID);
    jotaiStore.set(currentWorkspaceMemberState.atom, {
      userWorkspaceId: ME,
    } as never);
  });

  it('marks the first message from someone else since the member last read', () => {
    expect(
      getFirstUnreadMessageId({
        threadId: THREAD_ID,
        isUnread: true,
        lastReadAt: '2026-10-01T10:00:00.000Z',
      }),
    ).toBe('teammate');
  });

  it('marks an agent reply as new', () => {
    expect(
      getFirstUnreadMessageId({
        threadId: THREAD_ID,
        isUnread: true,
        lastReadAt: '2026-10-01T10:07:00.000Z',
      }),
    ).toBe('reply');
  });

  it('starts from the first message of others when the member never read the thread', () => {
    expect(
      getFirstUnreadMessageId({
        threadId: THREAD_ID,
        isUnread: true,
        lastReadAt: null,
      }),
    ).toBe('read');
  });

  it('shows nothing when the thread was read when opened', () => {
    expect(
      getFirstUnreadMessageId({
        threadId: THREAD_ID,
        isUnread: false,
        lastReadAt: '2026-10-01T10:00:00.000Z',
      }),
    ).toBeNull();
  });

  it('shows nothing for another thread than the one on screen', () => {
    expect(
      getFirstUnreadMessageId({
        threadId: 'other-thread',
        isUnread: true,
        lastReadAt: null,
      }),
    ).toBeNull();
  });

  it("never marks the member's own messages as new", () => {
    expect(
      getFirstUnreadMessageId(
        {
          threadId: THREAD_ID,
          isUnread: true,
          lastReadAt: '2026-10-01T10:00:00.000Z',
        },
        [
          buildMessage('mine', 'user', '2026-10-01T10:05:00.000Z', ME),
          buildMessage('legacy', 'user', '2026-10-01T10:06:00.000Z'),
        ],
      ),
    ).toBeNull();
  });
});
