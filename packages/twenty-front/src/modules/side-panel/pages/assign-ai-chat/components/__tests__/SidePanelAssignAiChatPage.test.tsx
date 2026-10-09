import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { SidePanelAssignAiChatPage } from '@/side-panel/pages/assign-ai-chat/components/SidePanelAssignAiChatPage';
import { assignAiChatThreadIdsComponentState } from '@/side-panel/pages/assign-ai-chat/states/assignAiChatThreadIdsComponentState';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { setAgentChatThreadList } from '@/ai/testing/setAgentChatThreadList';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { messages } from '~/locales/generated/en';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

const assignAgentChatThreads = jest.fn();
const closeSidePanelMenu = jest.fn();

jest.mock('@/ai/hooks/useAssignAgentChatThreads', () => ({
  useAssignAgentChatThreads: () => ({ assignAgentChatThreads }),
}));

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({ closeSidePanelMenu }),
}));

const PAGE_ID = 'assign-page';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <I18nProvider i18n={i18n}>
      <SidePanelPageComponentInstanceContext.Provider
        value={{ instanceId: PAGE_ID }}
      >
        <MemoryRouter>{children}</MemoryRouter>
      </SidePanelPageComponentInstanceContext.Provider>
    </I18nProvider>
  </JotaiProvider>
);

const setThreads = (threads: { id: string; assigneeId: string | null }[]) => {
  setAgentChatThreadList(
    jotaiStore,
    threads.map(
      ({ id, assigneeId }) =>
        ({
          __typename: 'AgentChatThread',
          id,
          deletedAt: null,
          assigneeId,
        }) as never,
    ),
  );
  jotaiStore.set(
    assignAiChatThreadIdsComponentState.atomFamily({ instanceId: PAGE_ID }),
    threads.map(({ id }) => id),
  );
};

describe('SidePanelAssignAiChatPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
    jotaiStore.set(currentWorkspaceMemberState.atom, {
      id: 'jane',
    } as never);
    jotaiStore.set(currentWorkspaceMembersState.atom, [
      {
        id: 'phil',
        name: { firstName: 'Phil', lastName: 'Schiler' },
        userEmail: 'phil@apple.dev',
      },
      {
        id: 'jane',
        name: { firstName: 'Jane', lastName: 'Austen' },
        userEmail: 'jane@apple.dev',
      },
    ] as never);
  });

  it('lists the member first and assigns the chats to the picked member', async () => {
    setThreads([
      { id: 'thread-1', assigneeId: null },
      { id: 'thread-2', assigneeId: null },
    ]);

    render(<SidePanelAssignAiChatPage />, { wrapper: Wrapper });

    const memberLabels = screen
      .getAllByText(/Austen|Schiler/)
      .map((element) => element.textContent);

    expect(memberLabels).toEqual(['Jane Austen', 'Phil Schiler']);
    expect(screen.queryByText('No assignee')).not.toBeInTheDocument();

    await userEvent.click(screen.getByText('Phil Schiler'));

    expect(closeSidePanelMenu).toHaveBeenCalled();
    expect(assignAgentChatThreads).toHaveBeenCalledWith({
      threadIds: ['thread-1', 'thread-2'],
      assigneeWorkspaceMemberId: 'phil',
    });
  });

  it('narrows the members to the search', async () => {
    setThreads([{ id: 'thread-1', assigneeId: null }]);

    render(<SidePanelAssignAiChatPage />, { wrapper: Wrapper });

    await userEvent.type(
      screen.getByPlaceholderText('Search members'),
      'phil@',
    );

    expect(screen.getByText('Phil Schiler')).toBeInTheDocument();
    expect(screen.queryByText('Jane Austen')).not.toBeInTheDocument();
  });

  it('offers to clear the assignee of an assigned chat', async () => {
    setThreads([{ id: 'thread-1', assigneeId: 'phil' }]);

    render(<SidePanelAssignAiChatPage />, { wrapper: Wrapper });

    await userEvent.click(screen.getByText('No assignee'));

    expect(assignAgentChatThreads).toHaveBeenCalledWith({
      threadIds: ['thread-1'],
      assigneeWorkspaceMemberId: null,
    });
  });
});
