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
import { useWorkspaceNavigationMenuContainers } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuContainers';
import { MainNavigationDrawerTabSwitcher } from '@/navigation/components/MainNavigationDrawerTabSwitcher';
import { useActiveNavigationDrawerTab } from '@/navigation/hooks/useActiveNavigationDrawerTab';
import { useIsNavigationDrawerContentExpanded } from '@/ui/navigation/navigation-drawer/hooks/useIsNavigationDrawerContentExpanded';
import { useNavigationDrawerTabs } from '@/navigation/hooks/useNavigationDrawerTabs';
import { useSwitchNavigationDrawerTab } from '@/navigation/hooks/useSwitchNavigationDrawerTab';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';
import { NavigationMenuItemType } from 'twenty-shared/types';

import { type NamedNavigationMenuItem } from '@/navigation-menu-item/common/types/NamedNavigationMenuItem';
import {
  GetAgentChatOpenThreadsSummaryDocument,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { mockedUserData } from '~/testing/mock-data/users';

jest.mock('@/navigation/hooks/useActiveNavigationDrawerTab');
jest.mock(
  '@/ui/navigation/navigation-drawer/hooks/useIsNavigationDrawerContentExpanded',
);
jest.mock('@/navigation/hooks/useNavigationDrawerTabs');
jest.mock('@/navigation/hooks/useSwitchNavigationDrawerTab');
jest.mock(
  '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuContainers',
);
jest.mock('@/navigation-menu-item/display/hooks/useActiveNavigationMenuTab');
jest.mock(
  '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController',
  () => ({
    useNavigationMenuItemEditController: () => ({ createItem: jest.fn() }),
  }),
);

let mockIsInboxEnabled = true;

jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: () => mockIsInboxEnabled,
}));

jest.mock('twenty-ui/utilities', () => ({
  ...jest.requireActual('twenty-ui/utilities'),
  useIsMobile: () => false,
}));

const mockSwitchNavigationDrawerTab = jest.fn();
const mockSwitchToNavigationMenuTab = jest.fn();

const salesTab: NamedNavigationMenuItem = {
  id: 'sales-tab-id',
  type: NavigationMenuItemType.TAB,
  name: 'Sales',
  icon: 'IconBriefcase',
  position: 0,
  isActive: true,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

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

const renderTabSwitcher = ({
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
          <MainNavigationDrawerTabSwitcher />
        </MockedProvider>
      </JotaiProvider>
    </I18nProvider>,
  );

  return { store };
};

const waitForOpenThreadsSummary = () =>
  act(() => new Promise((resolve) => setTimeout(resolve, 0)));

describe('MainNavigationDrawerTabSwitcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsInboxEnabled = true;

    jest.mocked(useNavigationDrawerTabs).mockReturnValue([
      {
        Icon: IconHome,
        label: 'Home',
        tab: NAVIGATION_DRAWER_TABS.NAVIGATION_MENU,
      },
      {
        Icon: IconComment,
        label: 'AI',
        tab: NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY,
      },
      {
        Icon: IconSettings,
        label: 'Settings',
        tab: NAVIGATION_DRAWER_TABS.SETTINGS,
      },
    ]);
    jest
      .mocked(useActiveNavigationDrawerTab)
      .mockReturnValue(NAVIGATION_DRAWER_TABS.NAVIGATION_MENU);
    jest.mocked(useSwitchNavigationDrawerTab).mockReturnValue({
      switchNavigationDrawerTab: mockSwitchNavigationDrawerTab,
      switchToNavigationMenuTab: mockSwitchToNavigationMenuTab,
    });
    jest.mocked(useWorkspaceNavigationMenuContainers).mockReturnValue([]);
    jest.mocked(useActiveNavigationMenuTab).mockReturnValue(null);
    jest.mocked(useIsNavigationDrawerContentExpanded).mockReturnValue(true);
  });

  it('switches tab from the collapsed icon rail', async () => {
    jest.mocked(useIsNavigationDrawerContentExpanded).mockReturnValue(false);

    renderTabSwitcher();

    await userEvent.click(screen.getByRole('button', { name: 'AI' }));

    expect(mockSwitchNavigationDrawerTab).toHaveBeenCalledTimes(1);
    expect(mockSwitchNavigationDrawerTab).toHaveBeenCalledWith(
      NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY,
    );
  });

  it('switches tab from the expanded row', async () => {
    renderTabSwitcher();

    await userEvent.click(screen.getByRole('button', { name: 'Settings' }));

    expect(mockSwitchNavigationDrawerTab).toHaveBeenCalledTimes(1);
    expect(mockSwitchNavigationDrawerTab).toHaveBeenCalledWith(
      NAVIGATION_DRAWER_TABS.SETTINGS,
    );
  });

  it.each([
    [true, 'Settings', NAVIGATION_DRAWER_TABS.SETTINGS],
    [false, 'Settings', NAVIGATION_DRAWER_TABS.SETTINGS],
    [true, 'AI', NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY],
    [false, 'AI', NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY],
  ] as const)(
    'disables navigation while editing layout with expanded=%s and tab=%s and restores it afterward',
    async (isExpanded, label, drawerTab) => {
      jest
        .mocked(useIsNavigationDrawerContentExpanded)
        .mockReturnValue(isExpanded);
      const { store } = renderTabSwitcher({
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

      expect(mockSwitchNavigationDrawerTab).not.toHaveBeenCalled();

      act(() => {
        store.set(isLayoutCustomizationModeEnabledState.atom, false);
      });

      expect(settingsButton).toHaveAttribute('aria-disabled', 'false');
      await userEvent.click(settingsButton);

      expect(mockSwitchNavigationDrawerTab).toHaveBeenCalledTimes(1);
      expect(mockSwitchNavigationDrawerTab).toHaveBeenCalledWith(drawerTab);
    },
  );

  it('marks the inbox while one of its open chats is unread', async () => {
    renderTabSwitcher({ hasUnreadOpenThread: true });

    expect(
      await screen.findByRole('button', { name: 'AI, 1 unread' }),
    ).toBeInTheDocument();
  });

  it('does not mark the inbox when its open chats are read', async () => {
    renderTabSwitcher();
    await waitForOpenThreadsSummary();

    expect(screen.getByRole('button', { name: 'AI' })).toBeInTheDocument();
  });

  it('does not mark unread chats while the inbox feature flag is off', async () => {
    mockIsInboxEnabled = false;
    renderTabSwitcher({ hasUnreadOpenThread: true });
    await waitForOpenThreadsSummary();

    expect(screen.getByRole('button', { name: 'AI' })).toBeInTheDocument();
  });

  it('does not mark the inbox while it is open', async () => {
    jest
      .mocked(useActiveNavigationDrawerTab)
      .mockReturnValue(NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY);
    renderTabSwitcher({ hasUnreadOpenThread: true });
    await waitForOpenThreadsSummary();

    expect(screen.getByRole('button', { name: 'AI' })).toBeInTheDocument();
  });

  it('renders nothing when no tab is available', () => {
    jest.mocked(useNavigationDrawerTabs).mockReturnValue([]);

    renderTabSwitcher();

    expect(
      screen.queryByRole('group', { name: 'Navigation modes' }),
    ).not.toBeInTheDocument();
  });

  it('opens a sidebar tab from its button', async () => {
    jest
      .mocked(useWorkspaceNavigationMenuContainers)
      .mockReturnValue([salesTab]);

    renderTabSwitcher();

    await userEvent.click(screen.getByRole('button', { name: 'Sales' }));

    expect(mockSwitchToNavigationMenuTab).toHaveBeenCalledTimes(1);
    expect(mockSwitchToNavigationMenuTab).toHaveBeenCalledWith('sales-tab-id');
    expect(mockSwitchNavigationDrawerTab).not.toHaveBeenCalled();
  });

  it('marks the open sidebar tab as current instead of Home', () => {
    jest
      .mocked(useWorkspaceNavigationMenuContainers)
      .mockReturnValue([salesTab]);
    jest.mocked(useActiveNavigationMenuTab).mockReturnValue(salesTab);

    renderTabSwitcher();

    expect(screen.getByRole('button', { name: 'Sales' })).toHaveAttribute(
      'aria-current',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Home' })).not.toHaveAttribute(
      'aria-current',
    );
  });
});
