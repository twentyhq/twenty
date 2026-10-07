import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { SidePanelSnoozeAiChatPage } from '@/side-panel/pages/snooze-ai-chat/components/SidePanelSnoozeAiChatPage';
import { snoozeAiChatIsInChannelComponentState } from '@/side-panel/pages/snooze-ai-chat/states/snoozeAiChatIsInChannelComponentState';
import { snoozeAiChatThreadIdsComponentState } from '@/side-panel/pages/snooze-ai-chat/states/snoozeAiChatThreadIdsComponentState';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const snoozeAgentChatThreads = jest.fn();
const snoozeAgentChatThreadsInChannel = jest.fn();
const closeSidePanelMenu = jest.fn();

jest.mock('@/ai/hooks/useAgentChatThreadParticipants', () => ({
  useAgentChatThreadParticipants: () => ({ snoozeAgentChatThreads }),
}));

jest.mock('@/ai/hooks/useAgentChatChannelThreadTriage', () => ({
  useAgentChatChannelThreadTriage: () => ({ snoozeAgentChatThreadsInChannel }),
}));

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({ closeSidePanelMenu }),
}));

const PAGE_ID = 'snooze-page';

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

describe('SidePanelSnoozeAiChatPage', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 9, 1, 17, 59));
    jest.clearAllMocks();
    resetJotaiStore();
    jotaiStore.set(
      snoozeAiChatThreadIdsComponentState.atomFamily({ instanceId: PAGE_ID }),
      ['thread-1', 'thread-2'],
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('snoozes the chats until the picked time', () => {
    render(<SidePanelSnoozeAiChatPage />, { wrapper: Wrapper });

    fireEvent.click(screen.getByText('This evening'));

    expect(closeSidePanelMenu).toHaveBeenCalled();
    expect(snoozeAgentChatThreads).toHaveBeenCalledWith({
      threadIds: ['thread-1', 'thread-2'],
      snoozedUntil: new Date(2026, 9, 1, 18, 0),
    });
  });

  it('snoozes the chats for their channel from a channel view', () => {
    jotaiStore.set(
      snoozeAiChatIsInChannelComponentState.atomFamily({ instanceId: PAGE_ID }),
      true,
    );

    render(<SidePanelSnoozeAiChatPage />, { wrapper: Wrapper });

    fireEvent.click(screen.getByText('This evening'));

    expect(snoozeAgentChatThreads).not.toHaveBeenCalled();
    expect(snoozeAgentChatThreadsInChannel).toHaveBeenCalledWith({
      threadIds: ['thread-1', 'thread-2'],
      snoozedUntil: new Date(2026, 9, 1, 18, 0),
    });
  });

  it('shows when each option ends', () => {
    render(<SidePanelSnoozeAiChatPage />, { wrapper: Wrapper });

    expect(screen.getByText('Today, 6:00 PM')).toBeInTheDocument();
  });

  it('opens the day and time picker for the chat in a dropdown', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(<SidePanelSnoozeAiChatPage />, { wrapper: Wrapper });

    await user.click(screen.getByText('Day & Time'));

    expect(
      await screen.findByRole('button', { name: /^Snooze until/ }),
    ).toBeInTheDocument();
    expect(snoozeAgentChatThreads).not.toHaveBeenCalled();
    expect(
      screen.getByText('Day & Time').closest('[data-focused]'),
    ).toHaveAttribute('data-focused', 'true');
  });

  it('refreshes the options instead of snoozing into the past', () => {
    render(<SidePanelSnoozeAiChatPage />, { wrapper: Wrapper });

    act(() => {
      jest.setSystemTime(new Date(2026, 9, 1, 18, 1));
    });
    fireEvent.click(screen.getByText('This evening'));

    expect(snoozeAgentChatThreads).not.toHaveBeenCalled();
    expect(screen.queryByText('This evening')).not.toBeInTheDocument();
    expect(screen.getByText('Tomorrow')).toBeInTheDocument();
  });
});
