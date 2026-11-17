import { MockedProvider } from '@apollo/client/testing/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IconComment, IconHome, IconSettings } from 'twenty-ui/icon';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useActiveNavigationMenuTab } from '@/navigation-menu-item/display/hooks/useActiveNavigationMenuTab';
import { useWorkspaceNavigationMenuTabs } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuTabs';
import { MainNavigationDrawerModeSwitcher } from '@/navigation/components/MainNavigationDrawerModeSwitcher';
import { useActiveNavigationDrawerMode } from '@/navigation/hooks/useActiveNavigationDrawerMode';
import { useIsNavigationDrawerContentExpanded } from '@/ui/navigation/navigation-drawer/hooks/useIsNavigationDrawerContentExpanded';
import { useNavigationDrawerModes } from '@/navigation/hooks/useNavigationDrawerModes';
import { useSwitchNavigationDrawerMode } from '@/navigation/hooks/useSwitchNavigationDrawerMode';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';
import { NavigationMenuItemType } from 'twenty-shared/types';
import {
  GetAgentChatOpenThreadsSummaryDocument,
  type NavigationMenuItem,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { mockedUserData } from '~/testing/mock-data/users';

jest.mock('@/navigation/hooks/useActiveNavigationDrawerMode');
jest.mock(
  '@/ui/navigation/navigation-drawer/hooks/useIsNavigationDrawerContentExpanded',
);
jest.mock('@/navigation/hooks/useNavigationDrawerModes');
jest.mock('@/navigation/hooks/useSwitchNavigationDrawerMode');
jest.mock(
  '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuTabs',
);
jest.mock('@/navigation-menu-item/display/hooks/useActiveNavigationMenuTab');

let mockIsInboxEnabled = true;

jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: () => mockIsInboxEnabled,
}));

jest.mock('twenty-ui/utilities', () => ({
  ...jest.requireActual('twenty-ui/utilities'),
  useIsMobile: () => false,
}));

const mockSwitchNavigationDrawerMode = jest.fn();
const mockSwitchToNavigationMenuTab = jest.fn();

const salesTab = {
  id: 'sales-tab-id',
  type: NavigationMenuItemType.TAB,
  name: 'Sales',
  icon: 'IconBriefcase',
  position: 0,
} as NavigationMenuItem & { name: string };

const buildOpenThreadsSummaryMock = (hasUnreadOpenThread: boolean) => ({
  request: { query: GetAgentChatOpenThreadsSummaryDocument },
  delay: 0,
  result: {
    data: {
      agentChatOpenThreadsSummary: {
        __typename: 'AgentChatOpenThreadsSummary' as const,
        openThreadCount: 1,
        unreadOpenThreadCount: hasUnreadOpenThread ? 1 : 0,
        needsInputThreadCount: 0,
        hasUnreadOpenThread,
        hasUnreadMentionThread: false,
        hasUnreadAssignedThread: false,
      },
    },
  },
});

const renderModeSwitcher = ({
  isLayoutCustomizationModeEnabled = false,
  hasUnreadOpenThread = false,
}: {
  isLayoutCustomizationModeEnabled?: boolean;
  hasUnreadOpenThread?: boolean;
} = {}) => {
  const store = createStore();

  store.set(
    isLayoutCustomizationModeEnabledState.atom,
    isLayoutCustomizationModeEnabled,
  );
  store.set(currentUserWorkspaceState.atom, {
    ...mockedUserData.currentUserWorkspace,
    permissionFlags: [PermissionFlagType.AI],
  });

  render(
    <I18nProvider i18n={i18n}>
      <JotaiProvider store={store}>
        <MockedProvider
          mocks={[buildOpenThreadsSummaryMock(hasUnreadOpenThread)]}
        >
          <MainNavigationDrawerModeSwitcher />
        </MockedProvider>
      </JotaiProvider>
    </I18nProvider>,
  );

  return { store };
};

const waitForOpenThreadsSummary = () =>
  act(() => new Promise((resolve) => setTimeout(resolve, 0)));

describe('MainNavigationDrawerModeSwitcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsInboxEnabled = true;

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
      switchToNavigationMenuTab: mockSwitchToNavigationMenuTab,
    });
    jest.mocked(useWorkspaceNavigationMenuTabs).mockReturnValue([]);
    jest.mocked(useActiveNavigationMenuTab).mockReturnValue(null);
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
      const { store } = renderModeSwitcher({
        isLayoutCustomizationModeEnabled: true,
      });
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

  it('marks the inbox while one of its open chats is unread', async () => {
    renderModeSwitcher({ hasUnreadOpenThread: true });

    expect(
      await screen.findByRole('button', { name: 'AI, 1 unread' }),
    ).toBeInTheDocument();
  });

  it('does not mark the inbox when its open chats are read', async () => {
    renderModeSwitcher();
    await waitForOpenThreadsSummary();

    expect(screen.getByRole('button', { name: 'AI' })).toBeInTheDocument();
  });

  it('does not mark unread chats while the inbox feature flag is off', async () => {
    mockIsInboxEnabled = false;
    renderModeSwitcher({ hasUnreadOpenThread: true });
    await waitForOpenThreadsSummary();

    expect(screen.getByRole('button', { name: 'AI' })).toBeInTheDocument();
  });

  it('does not mark the inbox while it is open', async () => {
    jest
      .mocked(useActiveNavigationDrawerMode)
      .mockReturnValue(NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY);
    renderModeSwitcher({ hasUnreadOpenThread: true });
    await waitForOpenThreadsSummary();

    expect(screen.getByRole('button', { name: 'AI' })).toBeInTheDocument();
  });

  it('renders nothing when no mode is available', () => {
    jest.mocked(useNavigationDrawerModes).mockReturnValue([]);

    renderModeSwitcher();

    expect(
      screen.queryByRole('group', { name: 'Navigation modes' }),
    ).not.toBeInTheDocument();
  });

  it('opens a sidebar tab from its button', async () => {
    jest.mocked(useWorkspaceNavigationMenuTabs).mockReturnValue([salesTab]);

    renderModeSwitcher();

    await userEvent.click(screen.getByRole('button', { name: 'Sales' }));

    expect(mockSwitchToNavigationMenuTab).toHaveBeenCalledWith('sales-tab-id');
    expect(mockSwitchNavigationDrawerMode).not.toHaveBeenCalled();
  });

  it('marks the open sidebar tab as current instead of Home', () => {
    jest.mocked(useWorkspaceNavigationMenuTabs).mockReturnValue([salesTab]);
    jest.mocked(useActiveNavigationMenuTab).mockReturnValue(salesTab);

    renderModeSwitcher();

    expect(screen.getByRole('button', { name: 'Sales' })).toHaveAttribute(
      'aria-current',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Home' })).not.toHaveAttribute(
      'aria-current',
    );
  });
});
