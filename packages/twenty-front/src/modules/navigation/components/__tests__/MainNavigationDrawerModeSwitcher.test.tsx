import { createStore, Provider as JotaiProvider } from 'jotai';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IconComment, IconHome, IconSettings } from 'twenty-ui/icon';

import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { setAgentChatThreadList } from '@/ai/testing/setAgentChatThreadList';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { MainNavigationDrawerModeSwitcher } from '@/navigation/components/MainNavigationDrawerModeSwitcher';
import { useActiveNavigationDrawerMode } from '@/navigation/hooks/useActiveNavigationDrawerMode';
import { useIsNavigationDrawerContentExpanded } from '@/navigation/hooks/useIsNavigationDrawerContentExpanded';
import { useNavigationDrawerModes } from '@/navigation/hooks/useNavigationDrawerModes';
import { useSwitchNavigationDrawerMode } from '@/navigation/hooks/useSwitchNavigationDrawerMode';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';

jest.mock('@/navigation/hooks/useActiveNavigationDrawerMode');
jest.mock('@/navigation/hooks/useIsNavigationDrawerContentExpanded');
jest.mock('@/navigation/hooks/useNavigationDrawerModes');
jest.mock('@/navigation/hooks/useSwitchNavigationDrawerMode');

jest.mock('twenty-ui/utilities', () => ({
  ...jest.requireActual('twenty-ui/utilities'),
  useIsMobile: () => false,
}));

const mockSwitchNavigationDrawerMode = jest.fn();

const THREAD_ID = 'thread-1';
const LAST_ACTIVITY_AT = '2026-10-01T10:00:00.000Z';

const receiveOpenChat = (
  store: ReturnType<typeof createStore>,
  lastReadAt: string | null,
) => {
  setAgentChatThreadList(store, [
    {
      __typename: 'AgentChatThread',
      id: THREAD_ID,
      deletedAt: null,
      lastActivityAt: LAST_ACTIVITY_AT,
    } as never,
  ]);
  store.set(agentChatThreadParticipantsState.atom, {
    [THREAD_ID]: {
      threadId: THREAD_ID,
      lastReadAt,
      archivedAt: null,
      snoozedUntil: null,
      hasSnoozeEnded: false,
    },
  });
};

const renderModeSwitcher = (isLayoutCustomizationModeEnabled = false) => {
  const store = createStore();

  store.set(
    isLayoutCustomizationModeEnabledState.atom,
    isLayoutCustomizationModeEnabled,
  );

  render(
    <I18nProvider i18n={i18n}>
      <JotaiProvider store={store}>
        <MainNavigationDrawerModeSwitcher />
      </JotaiProvider>
    </I18nProvider>,
  );

  return { store };
};

describe('MainNavigationDrawerModeSwitcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jest.mocked(useNavigationDrawerModes).mockReturnValue([
      {
        Icon: IconHome,
        label: 'Home',
        mode: NAVIGATION_DRAWER_TABS.NAVIGATION_MENU,
      },
      {
        Icon: IconComment,
        label: 'AI',
        mode: NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY,
      },
      {
        Icon: IconSettings,
        label: 'Settings',
        mode: NAVIGATION_DRAWER_TABS.SETTINGS,
      },
    ]);
    jest
      .mocked(useActiveNavigationDrawerMode)
      .mockReturnValue(NAVIGATION_DRAWER_TABS.NAVIGATION_MENU);
    jest.mocked(useSwitchNavigationDrawerMode).mockReturnValue({
      switchNavigationDrawerMode: mockSwitchNavigationDrawerMode,
    });
    jest.mocked(useIsNavigationDrawerContentExpanded).mockReturnValue(true);
  });

  it('switches mode from the collapsed icon rail', async () => {
    jest.mocked(useIsNavigationDrawerContentExpanded).mockReturnValue(false);

    renderModeSwitcher();

    await userEvent.click(screen.getByRole('button', { name: 'AI' }));

    expect(mockSwitchNavigationDrawerMode).toHaveBeenCalledTimes(1);
    expect(mockSwitchNavigationDrawerMode).toHaveBeenCalledWith(
      NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY,
    );
  });

  it('switches mode from the expanded row', async () => {
    renderModeSwitcher();

    await userEvent.click(screen.getByRole('button', { name: 'Settings' }));

    expect(mockSwitchNavigationDrawerMode).toHaveBeenCalledTimes(1);
    expect(mockSwitchNavigationDrawerMode).toHaveBeenCalledWith(
      NAVIGATION_DRAWER_TABS.SETTINGS,
    );
  });

  it.each([
    [true, 'Settings', NAVIGATION_DRAWER_TABS.SETTINGS],
    [false, 'Settings', NAVIGATION_DRAWER_TABS.SETTINGS],
    [true, 'AI', NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY],
    [false, 'AI', NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY],
  ] as const)(
    'disables navigation while editing layout with expanded=%s and mode=%s and restores it afterward',
    async (isExpanded, label, mode) => {
      jest
        .mocked(useIsNavigationDrawerContentExpanded)
        .mockReturnValue(isExpanded);
      const { store } = renderModeSwitcher(true);
      const settingsButton = screen.getByRole('button', { name: label });

      expect(settingsButton).toHaveAttribute('aria-disabled', 'true');
      expect(screen.getByRole('button', { name: 'Home' })).toBeEnabled();
      expect(screen.getByRole('button', { name: 'Home' })).toHaveAttribute(
        'aria-disabled',
        'false',
      );

      await userEvent.click(settingsButton);
      expect(settingsButton).toHaveFocus();
      await userEvent.keyboard('{Enter} ');

      expect(mockSwitchNavigationDrawerMode).not.toHaveBeenCalled();

      act(() => {
        store.set(isLayoutCustomizationModeEnabledState.atom, false);
      });

      expect(settingsButton).toHaveAttribute('aria-disabled', 'false');
      await userEvent.click(settingsButton);

      expect(mockSwitchNavigationDrawerMode).toHaveBeenCalledTimes(1);
      expect(mockSwitchNavigationDrawerMode).toHaveBeenCalledWith(mode);
    },
  );

  it('marks the inbox while one of its open chats is unread', () => {
    const { store } = renderModeSwitcher();

    act(() => receiveOpenChat(store, null));

    expect(
      screen.getByRole('button', { name: 'AI, unread' }),
    ).toBeInTheDocument();

    act(() => receiveOpenChat(store, LAST_ACTIVITY_AT));

    expect(screen.getByRole('button', { name: 'AI' })).toBeInTheDocument();
  });

  it('does not mark the inbox while it is open', () => {
    jest
      .mocked(useActiveNavigationDrawerMode)
      .mockReturnValue(NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY);
    const { store } = renderModeSwitcher();

    act(() => receiveOpenChat(store, null));

    expect(screen.getByRole('button', { name: 'AI' })).toBeInTheDocument();
  });

  it('renders nothing when no mode is available', () => {
    jest.mocked(useNavigationDrawerModes).mockReturnValue([]);

    renderModeSwitcher();

    expect(
      screen.queryByRole('group', { name: 'Navigation modes' }),
    ).not.toBeInTheDocument();
  });
});
