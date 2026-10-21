import { render } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';

import { AgentChatThreadMarkAsReadEffect } from '@/ai/components/AgentChatThreadMarkAsReadEffect';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { agentChatThreadVisitState } from '@/ai/states/agentChatThreadVisitState';
import { setAgentChatThreadList } from '@/ai/testing/setAgentChatThreadList';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const updateAgentChatThreadInboxState = jest.fn();

jest.mock('@/ai/hooks/useUpdateAgentChatThreadInboxState', () => ({
  useUpdateAgentChatThreadInboxState: () => ({
    updateAgentChatThreadInboxState,
  }),
}));

const THREAD_ID = '6f1c2b0e-7a4d-4e8b-9c3f-2d5a1b8e7c60';
const WORKSPACE_MEMBER_ID = '20202020-0687-4c41-b707-ed1bfca972a7';
const LAST_ACTIVITY_AT = '2026-10-01T10:00:00.000Z';

const renderChatView = () =>
  render(
    <JotaiProvider store={jotaiStore}>
      <AgentChatThreadMarkAsReadEffect />
    </JotaiProvider>,
  );

describe('AgentChatThreadMarkAsReadEffect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
    setAgentChatThreadList(jotaiStore, [
      {
        __typename: 'AgentChatThread',
        id: THREAD_ID,
        deletedAt: null,
        lastActivityAt: LAST_ACTIVITY_AT,
        lastMessageSenderWorkspaceMemberId: null,
        workspaceMemberId: WORKSPACE_MEMBER_ID,
        assigneeId: null,
        pendingQuestionMessageId: null,
      } as never,
    ]);
    jotaiStore.set(currentWorkspaceMemberState.atom, {
      id: WORKSPACE_MEMBER_ID,
    } as never);
    jotaiStore.set(agentChatThreadParticipantsState.atom, {
      [THREAD_ID]: {
        threadId: THREAD_ID,
        lastReadAt: '2026-10-01T09:00:00.000Z',
        archivedAt: null,
        snoozedUntil: null,
        isSubscribed: true,
        lastMentionedAt: null,
        id: 'participant-id',
        updatedAt: '2026-10-01T10:00:00.000Z',
      },
    });
    jotaiStore.set(agentChatDisplayedThreadState.atom, THREAD_ID);
  });

  it('marks the thread on screen as read and keeps where the member left off', () => {
    renderChatView();

    expect(updateAgentChatThreadInboxState).toHaveBeenCalledWith({
      threadIds: [THREAD_ID],
      action: 'READ',
    });
    expect(jotaiStore.get(agentChatThreadVisitState.atom)).toEqual({
      threadId: THREAD_ID,
      isUnread: true,
      lastReadAt: '2026-10-01T09:00:00.000Z',
      isKeptUnread: false,
    });
  });

  it('starts tracking a thread the member opens without participating in it', () => {
    jotaiStore.set(agentChatThreadParticipantsState.atom, {});

    renderChatView();

    expect(updateAgentChatThreadInboxState).toHaveBeenCalledTimes(1);
    expect(updateAgentChatThreadInboxState).toHaveBeenCalledWith({
      threadIds: [THREAD_ID],
      action: 'READ',
    });
    expect(jotaiStore.get(agentChatThreadVisitState.atom)).toEqual({
      threadId: THREAD_ID,
      isUnread: false,
      lastReadAt: null,
      isKeptUnread: false,
    });
  });

  it('keeps the visit while another view still shows the thread', () => {
    const sidePanelView = renderChatView();
    const recordPageView = renderChatView();

    sidePanelView.unmount();

    expect(jotaiStore.get(agentChatThreadVisitState.atom)?.threadId).toBe(
      THREAD_ID,
    );

    recordPageView.unmount();

    expect(jotaiStore.get(agentChatThreadVisitState.atom)).toBeNull();
  });

  describe('on leaving the chat', () => {
    const setReadUpTo = (lastReadAt: string) => {
      const participant = jotaiStore.get(
        agentChatThreadParticipantsState.atom,
      )?.[THREAD_ID];

      jotaiStore.set(agentChatThreadParticipantsState.atom, {
        [THREAD_ID]: { ...participant, threadId: THREAD_ID, lastReadAt },
      } as never);
    };

    it('files a chat the member read up to the agent reply', () => {
      setReadUpTo(LAST_ACTIVITY_AT);

      renderChatView().unmount();

      expect(updateAgentChatThreadInboxState).toHaveBeenCalledWith({
        threadIds: [THREAD_ID],
        action: 'ARCHIVE',
      });
    });

    it('keeps a chat in the inbox while another view still shows it', () => {
      setReadUpTo(LAST_ACTIVITY_AT);

      const sidePanelView = renderChatView();
      const recordPageView = renderChatView();

      sidePanelView.unmount();

      expect(updateAgentChatThreadInboxState).not.toHaveBeenCalledWith(
        expect.objectContaining({ action: 'ARCHIVE' }),
      );

      recordPageView.unmount();

      expect(updateAgentChatThreadInboxState).toHaveBeenCalledWith({
        threadIds: [THREAD_ID],
        action: 'ARCHIVE',
      });
    });

    it('keeps a chat whose reply the member has not read', () => {
      renderChatView().unmount();

      expect(updateAgentChatThreadInboxState).not.toHaveBeenCalledWith(
        expect.objectContaining({ action: 'ARCHIVE' }),
      );
    });
  });
});
