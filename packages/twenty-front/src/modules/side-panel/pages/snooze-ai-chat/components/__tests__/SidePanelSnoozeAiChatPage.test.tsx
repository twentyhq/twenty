import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { SidePanelSnoozeAiChatPage } from '@/side-panel/pages/snooze-ai-chat/components/SidePanelSnoozeAiChatPage';
import { snoozeAiChatThreadIdComponentState } from '@/side-panel/pages/snooze-ai-chat/states/snoozeAiChatThreadIdComponentState';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const snoozeAgentChatThread = jest.fn();
const closeSidePanelMenu = jest.fn();

jest.mock('@/ai/hooks/useAgentChatThreadParticipants', () => ({
  useAgentChatThreadParticipants: () => ({ snoozeAgentChatThread }),
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
      snoozeAiChatThreadIdComponentState.atomFamily({ instanceId: PAGE_ID }),
      'thread-1',
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('snoozes the chat until the picked time', () => {
    render(<SidePanelSnoozeAiChatPage />, { wrapper: Wrapper });

    fireEvent.click(screen.getByText('This evening'));

    expect(closeSidePanelMenu).toHaveBeenCalled();
    expect(snoozeAgentChatThread).toHaveBeenCalledWith(
      'thread-1',
      new Date(2026, 9, 1, 18, 0),
    );
  });

  it('refreshes the options instead of snoozing into the past', () => {
    render(<SidePanelSnoozeAiChatPage />, { wrapper: Wrapper });

    act(() => {
      jest.setSystemTime(new Date(2026, 9, 1, 18, 1));
    });
    fireEvent.click(screen.getByText('This evening'));

    expect(snoozeAgentChatThread).not.toHaveBeenCalled();
    expect(screen.queryByText('This evening')).not.toBeInTheDocument();
    expect(screen.getByText('Tomorrow')).toBeInTheDocument();
  });
});
