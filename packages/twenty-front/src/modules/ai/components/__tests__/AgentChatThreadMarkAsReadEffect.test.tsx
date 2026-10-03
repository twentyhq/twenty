import { render } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';

import { AgentChatThreadMarkAsReadEffect } from '@/ai/components/AgentChatThreadMarkAsReadEffect';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { agentChatThreadVisitState } from '@/ai/states/agentChatThreadVisitState';
import { setAgentChatThreadList } from '@/ai/testing/setAgentChatThreadList';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const markAgentChatThreadAsRead = jest.fn();

jest.mock('@/ai/hooks/useAgentChatThreadParticipants', () => ({
  useAgentChatThreadParticipants: () => ({ markAgentChatThreadAsRead }),
}));

const THREAD_ID = '6f1c2b0e-7a4d-4e8b-9c3f-2d5a1b8e7c60';

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
        lastActivityAt: '2026-10-01T10:00:00.000Z',
      } as never,
    ]);
    jotaiStore.set(agentChatThreadParticipantsState.atom, {
      [THREAD_ID]: {
        threadId: THREAD_ID,
        lastReadAt: '2026-10-01T09:00:00.000Z',
        archivedAt: null,
        snoozedUntil: null,
        hasSnoozeEnded: false,
      },
    });
    jotaiStore.set(agentChatDisplayedThreadState.atom, THREAD_ID);
  });

  it('marks the thread on screen as read and keeps where the member left off', () => {
    renderChatView();

    expect(markAgentChatThreadAsRead).toHaveBeenCalledWith(THREAD_ID);
    expect(jotaiStore.get(agentChatThreadVisitState.atom)).toEqual({
      threadId: THREAD_ID,
      isUnread: true,
      lastReadAt: '2026-10-01T09:00:00.000Z',
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
});
