import { act, render } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';

import { AiChatThreadMarkAsReadEffect } from '@/ai-chat/threads/components/AiChatThreadMarkAsReadEffect';
import { AiChatThreadOpenViewEffect } from '@/ai-chat/threads/components/AiChatThreadOpenViewEffect';
import { AiChatTestInstance } from '@/ai-chat/testing/AiChatTestInstance';
import { aiChatReopenedThreadActivityState } from '@/ai-chat/threads/states/aiChatReopenedThreadActivityState';
import { aiChatThreadParticipantsState } from '@/ai-chat/threads/states/aiChatThreadParticipantsState';
import { aiChatThreadVisitFamilyState } from '@/ai-chat/threads/states/aiChatThreadVisitFamilyState';
import { setInboxThreadList } from '@/inbox/testing/setInboxThreadList';
import {
  type CurrentWorkspaceMember,
  currentWorkspaceMemberState,
} from '@/auth/states/currentWorkspaceMemberState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { type AgentChatThreadParticipantFieldsFragment } from '~/generated-metadata/graphql';

const updateAgentChatThreadInboxState = jest.fn();

jest.mock('@/ai-chat/threads/hooks/useUpdateAiChatThreadStatus', () => ({
  useUpdateAiChatThreadStatus: () => ({
    updateAgentChatThreadInboxState,
  }),
}));

const THREAD_ID = '6f1c2b0e-7a4d-4e8b-9c3f-2d5a1b8e7c60';
const WORKSPACE_MEMBER_ID = '20202020-0687-4c41-b707-ed1bfca972a7';
const LAST_ACTIVITY_AT = '2026-10-01T10:00:00.000Z';

const CURRENT_WORKSPACE_MEMBER: CurrentWorkspaceMember = {
  id: WORKSPACE_MEMBER_ID,
  name: { firstName: 'Tim', lastName: 'Apple' },
  locale: 'en',
  colorScheme: 'Light',
  userEmail: 'tim@apple.dev',
};

const PARTICIPANT: AgentChatThreadParticipantFieldsFragment = {
  id: 'participant-id',
  threadId: THREAD_ID,
  lastReadAt: '2026-10-01T09:00:00.000Z',
  archivedAt: null,
  snoozedUntil: null,
  isSubscribed: true,
  lastMentionedAt: null,
  mentionsResolvedAt: null,
  updatedAt: LAST_ACTIVITY_AT,
  __typename: 'AgentChatThreadParticipant',
};

const renderChatView = () =>
  render(
    <JotaiProvider store={jotaiStore}>
      <AiChatTestInstance threadId={THREAD_ID}>
        <AiChatThreadOpenViewEffect threadId={THREAD_ID} />
        <AiChatThreadMarkAsReadEffect />
      </AiChatTestInstance>
    </JotaiProvider>,
  );

const leaveChatView = async (view: ReturnType<typeof renderChatView>) => {
  view.unmount();
  await act(() => Promise.resolve());
};

describe('AiChatThreadMarkAsReadEffect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
    setInboxThreadList(jotaiStore, [
      {
        __typename: 'AgentChatThread',
        id: THREAD_ID,
        title: null,
        createdAt: LAST_ACTIVITY_AT,
        updatedAt: LAST_ACTIVITY_AT,
        deletedAt: null,
        lastActivityAt: LAST_ACTIVITY_AT,
        lastMessageSenderWorkspaceMemberId: null,
        workspaceMemberId: WORKSPACE_MEMBER_ID,
        assigneeId: null,
        pendingQuestionMessageId: null,
      },
    ]);
    jotaiStore.set(currentWorkspaceMemberState.atom, CURRENT_WORKSPACE_MEMBER);
    jotaiStore.set(aiChatThreadParticipantsState.atom, {
      [THREAD_ID]: PARTICIPANT,
    });
  });

  it('marks the thread on screen as read and keeps where the member left off', () => {
    renderChatView();

    expect(updateAgentChatThreadInboxState).toHaveBeenCalledWith({
      threadIds: [THREAD_ID],
      action: 'READ',
    });
    expect(
      jotaiStore.get(
        aiChatThreadVisitFamilyState.atomFamily({ threadId: THREAD_ID }),
      ),
    ).toEqual({
      threadId: THREAD_ID,
      isUnread: true,
      lastReadAt: '2026-10-01T09:00:00.000Z',
      isKeptUnread: false,
      readRequestedForActivityAt: LAST_ACTIVITY_AT,
      readRequestedForParticipantUpdatedAt: PARTICIPANT.updatedAt,
    });
  });

  it('starts tracking a thread the member opens without participating in it', () => {
    jotaiStore.set(aiChatThreadParticipantsState.atom, {});

    renderChatView();

    expect(updateAgentChatThreadInboxState).toHaveBeenCalledTimes(1);
    expect(updateAgentChatThreadInboxState).toHaveBeenCalledWith({
      threadIds: [THREAD_ID],
      action: 'READ',
    });
    expect(
      jotaiStore.get(
        aiChatThreadVisitFamilyState.atomFamily({ threadId: THREAD_ID }),
      ),
    ).toEqual({
      threadId: THREAD_ID,
      isUnread: false,
      lastReadAt: null,
      isKeptUnread: false,
      readRequestedForActivityAt: LAST_ACTIVITY_AT,
    });
  });

  it('keeps the visit while another view still shows the thread', async () => {
    const sidePanelView = renderChatView();
    const recordPageView = renderChatView();

    await leaveChatView(sidePanelView);

    expect(
      jotaiStore.get(
        aiChatThreadVisitFamilyState.atomFamily({ threadId: THREAD_ID }),
      )?.threadId,
    ).toBe(THREAD_ID);

    await leaveChatView(recordPageView);

    expect(
      jotaiStore.get(
        aiChatThreadVisitFamilyState.atomFamily({ threadId: THREAD_ID }),
      ),
    ).toBeNull();
  });

  describe('on leaving the chat', () => {
    const setReadUpTo = (lastReadAt: string) =>
      jotaiStore.set(aiChatThreadParticipantsState.atom, {
        [THREAD_ID]: { ...PARTICIPANT, lastReadAt },
      });

    it('files a chat the member read up to the agent reply', async () => {
      setReadUpTo(LAST_ACTIVITY_AT);

      await leaveChatView(renderChatView());

      expect(updateAgentChatThreadInboxState).toHaveBeenCalledWith({
        threadIds: [THREAD_ID],
        action: 'ARCHIVE',
      });
    });

    it('keeps a chat in the inbox while another view still shows it', async () => {
      setReadUpTo(LAST_ACTIVITY_AT);

      const sidePanelView = renderChatView();
      const recordPageView = renderChatView();

      await leaveChatView(sidePanelView);

      expect(updateAgentChatThreadInboxState).not.toHaveBeenCalledWith(
        expect.objectContaining({ action: 'ARCHIVE' }),
      );

      await leaveChatView(recordPageView);

      expect(updateAgentChatThreadInboxState).toHaveBeenCalledWith({
        threadIds: [THREAD_ID],
        action: 'ARCHIVE',
      });
    });

    it('keeps a chat the member reopened since its last activity', async () => {
      setReadUpTo(LAST_ACTIVITY_AT);
      jotaiStore.set(aiChatReopenedThreadActivityState.atom, {
        [THREAD_ID]: LAST_ACTIVITY_AT,
      });

      await leaveChatView(renderChatView());

      expect(updateAgentChatThreadInboxState).not.toHaveBeenCalledWith(
        expect.objectContaining({ action: 'ARCHIVE' }),
      );
    });

    it('files a reopened chat once something new happened in it', async () => {
      setReadUpTo(LAST_ACTIVITY_AT);
      jotaiStore.set(aiChatReopenedThreadActivityState.atom, {
        [THREAD_ID]: '2026-10-01T08:00:00.000Z',
      });

      await leaveChatView(renderChatView());

      expect(updateAgentChatThreadInboxState).toHaveBeenCalledWith({
        threadIds: [THREAD_ID],
        action: 'ARCHIVE',
      });
    });

    it('keeps a chat whose reply the member has not read', async () => {
      await leaveChatView(renderChatView());

      expect(updateAgentChatThreadInboxState).not.toHaveBeenCalledWith(
        expect.objectContaining({ action: 'ARCHIVE' }),
      );
    });

    it('files a chat once when all its views close in the same render', async () => {
      setReadUpTo(LAST_ACTIVITY_AT);

      const view = render(
        <JotaiProvider store={jotaiStore}>
          <AiChatTestInstance>
            <AiChatThreadOpenViewEffect threadId={THREAD_ID} />
            <AiChatThreadMarkAsReadEffect />
          </AiChatTestInstance>
          <AiChatTestInstance>
            <AiChatThreadOpenViewEffect threadId={THREAD_ID} />
            <AiChatThreadMarkAsReadEffect />
          </AiChatTestInstance>
        </JotaiProvider>,
      );

      await leaveChatView(view);

      expect(updateAgentChatThreadInboxState).toHaveBeenCalledTimes(1);
      expect(updateAgentChatThreadInboxState).toHaveBeenCalledWith({
        threadIds: [THREAD_ID],
        action: 'ARCHIVE',
      });
    });

    it('keeps a chat its page shows until the page leaves it', async () => {
      setReadUpTo(LAST_ACTIVITY_AT);

      const page = render(
        <JotaiProvider store={jotaiStore}>
          <AiChatThreadOpenViewEffect threadId={THREAD_ID} />
        </JotaiProvider>,
      );

      await leaveChatView(renderChatView());

      expect(updateAgentChatThreadInboxState).not.toHaveBeenCalledWith(
        expect.objectContaining({ action: 'ARCHIVE' }),
      );

      page.unmount();
      await act(() => Promise.resolve());

      expect(updateAgentChatThreadInboxState).toHaveBeenCalledWith({
        threadIds: [THREAD_ID],
        action: 'ARCHIVE',
      });
    });

    it('keeps a chat handed to another view in the same render', async () => {
      setReadUpTo(LAST_ACTIVITY_AT);

      const renderViewOf = (page: string) => (
        <JotaiProvider store={jotaiStore}>
          <AiChatTestInstance key={page} threadId={THREAD_ID}>
            <AiChatThreadOpenViewEffect threadId={THREAD_ID} />
            <AiChatThreadMarkAsReadEffect />
          </AiChatTestInstance>
        </JotaiProvider>
      );
      const view = render(renderViewOf('new-chat-page'));

      view.rerender(renderViewOf('thread-page'));
      await act(() => Promise.resolve());

      expect(updateAgentChatThreadInboxState).not.toHaveBeenCalledWith(
        expect.objectContaining({ action: 'ARCHIVE' }),
      );
      expect(
        jotaiStore.get(
          aiChatThreadVisitFamilyState.atomFamily({ threadId: THREAD_ID }),
        )?.threadId,
      ).toBe(THREAD_ID);
    });
  });
});
