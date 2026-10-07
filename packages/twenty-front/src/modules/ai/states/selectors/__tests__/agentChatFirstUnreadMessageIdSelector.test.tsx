import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatMessagesFamilyState } from '@/ai/states/agentChatMessagesFamilyState';
import {
  type AgentChatThreadVisit,
  agentChatThreadVisitState,
} from '@/ai/states/agentChatThreadVisitState';
import { agentChatFirstUnreadMessageIdSelector } from '@/ai/states/selectors/agentChatFirstUnreadMessageIdSelector';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const THREAD_ID = 'thread';
const ME = 'my-user-workspace-id';
const TEAMMATE = 'teammate-user-workspace-id';
const MY_WORKSPACE_MEMBER_ID = 'my-workspace-member-id';

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
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

const getFirstUnreadMessageId = (
  visit: Omit<AgentChatThreadVisit, 'isKeptUnread'>,
  messages = MESSAGES,
) => {
  jotaiStore.set(agentChatThreadVisitState.atom, {
    ...visit,
    isKeptUnread: false,
  });
  jotaiStore.set(
    agentChatMessagesFamilyState.atomFamily({ threadId: THREAD_ID }),
    messages,
  );

  return renderHook(
    () => useAtomStateValue(agentChatFirstUnreadMessageIdSelector),
    { wrapper: Wrapper },
  ).result.current;
};

describe('agentChatFirstUnreadMessageIdSelector', () => {
  beforeEach(() => {
    resetJotaiStore();
    jotaiStore.set(agentChatDisplayedThreadState.atom, THREAD_ID);
    jotaiStore.set(currentWorkspaceMemberState.atom, {
      id: MY_WORKSPACE_MEMBER_ID,
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

  it('treats messages without a sender as the owner of a thread shared with the member', () => {
    jotaiStore.set(recordStoreFamilyState.atomFamily(THREAD_ID), {
      id: THREAD_ID,
      __typename: 'AgentChatThread',
      workspaceMemberId: 'owner-workspace-member-id',
    });

    expect(
      getFirstUnreadMessageId(
        {
          threadId: THREAD_ID,
          isUnread: true,
          lastReadAt: null,
        },
        [
          buildMessage('legacy', 'user', '2026-10-01T10:06:00.000Z'),
          buildMessage('reply', 'assistant', '2026-10-01T10:08:00.000Z'),
        ],
      ),
    ).toBe('legacy');
  });
});
