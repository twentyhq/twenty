import { MockedProvider } from '@apollo/client/testing/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IconComment, IconHome, IconSettings } from 'twenty-ui/icon';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { selectedNavigationMenuItemIdInEditModeState } from '@/navigation-menu-item/common/states/selectedNavigationMenuItemIdInEditModeState';
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
import { type InboxChatAttention } from '@/inbox/types/InboxChatAttention';
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

jest.mock('@/navigation/hooks/useCanCustomizeSidebar', () => ({
  useCanCustomizeSidebar: () => mockCanCustomizeSidebar,
}));

const mockEnterLayoutCustomizationMode = jest.fn();

jest.mock(
  '@/layout-customization/hooks/useEnterLayoutCustomizationMode',
  () => ({
    useEnterLayoutCustomizationMode: () => ({
      enterLayoutCustomizationMode: mockEnterLayoutCustomizationMode,
    }),
  }),
);

let mockIsInboxEnabled = true;
let mockCanCustomizeSidebar = true;
let mockChatAttention: {
  chatAttention: InboxChatAttention | null;
  unreadOpenThreadCount: number;
  getTabChatAttention: (tabId: string | null) => InboxChatAttention | null;
} | null = null;

jest.mock(
  '@/navigation-menu-item/display/hooks/useNavigationMenuChatAttention',
  () => {
    const actualModule = jest.requireActual(
      '@/navigation-menu-item/display/hooks/useNavigationMenuChatAttention',
    );

    return {
      useNavigationMenuChatAttention: () =>
        mockChatAttention ?? actualModule.useNavigationMenuChatAttention(),
    };
  },
);

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
  isPinnedToBottom = false,
}: {
  isLayoutCustomizationModeEnabled?: boolean;
  hasUnreadOpenThread?: boolean;
  isPinnedToBottom?: boolean;
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
          <MainNavigationDrawerTabSwitcher
            isPinnedToBottom={isPinnedToBottom}
          />
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
    mockCanCustomizeSidebar = true;
    mockChatAttention = null;

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
      switchToNavigationMenu: jest.fn(),
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

  it('hides the bottom tabs when only one tab is visible outside edit mode', () => {
    jest.mocked(useNavigationDrawerTabs).mockReturnValue([
      {
        Icon: IconHome,
        label: 'Home',
        tab: NAVIGATION_DRAWER_TABS.NAVIGATION_MENU,
      },
    ]);

    renderTabSwitcher({ isPinnedToBottom: true });

    expect(
      screen.queryByRole('group', { name: 'Navigation modes' }),
    ).not.toBeInTheDocument();
  });

  it('keeps the bottom tabs when only one tab is visible in edit mode', () => {
    jest.mocked(useNavigationDrawerTabs).mockReturnValue([
      {
        Icon: IconHome,
        label: 'Home',
        tab: NAVIGATION_DRAWER_TABS.NAVIGATION_MENU,
      },
    ]);

    renderTabSwitcher({
      isPinnedToBottom: true,
      isLayoutCustomizationModeEnabled: true,
    });

    expect(
      screen.getByRole('group', { name: 'Navigation modes' }),
    ).toBeInTheDocument();
  });

  it('keeps the bottom tabs when a sidebar tab is visible next to Home', () => {
    jest.mocked(useNavigationDrawerTabs).mockReturnValue([
      {
        Icon: IconHome,
        label: 'Home',
        tab: NAVIGATION_DRAWER_TABS.NAVIGATION_MENU,
      },
    ]);
    jest
      .mocked(useWorkspaceNavigationMenuContainers)
      .mockReturnValue([salesTab]);

    renderTabSwitcher({ isPinnedToBottom: true });

    expect(
      screen.getByRole('group', { name: 'Navigation modes' }),
    ).toBeInTheDocument();
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

  it('opens a sidebar tab and its menu on right-click in edit mode', async () => {
    jest
      .mocked(useWorkspaceNavigationMenuContainers)
      .mockReturnValue([salesTab]);

    renderTabSwitcher({ isLayoutCustomizationModeEnabled: true });

    await userEvent.pointer({
      keys: '[MouseRight]',
      target: screen.getByLabelText('Sales'),
    });

    expect(mockSwitchToNavigationMenuTab).toHaveBeenCalledWith('sales-tab-id');
    expect(await screen.findByText('Delete tab')).toBeInTheDocument();
  });

  it('does not open the sidebar tab menu on right-click outside edit mode', async () => {
    jest
      .mocked(useWorkspaceNavigationMenuContainers)
      .mockReturnValue([salesTab]);

    renderTabSwitcher();

    await userEvent.pointer({
      keys: '[MouseRight]',
      target: screen.getByLabelText('Sales'),
    });

    expect(mockSwitchToNavigationMenuTab).not.toHaveBeenCalled();
    expect(screen.queryByText('Delete tab')).not.toBeInTheDocument();
  });

  it('opens the customize menu when the active sidebar tab is clicked again', async () => {
    jest
      .mocked(useWorkspaceNavigationMenuContainers)
      .mockReturnValue([salesTab]);
    jest.mocked(useActiveNavigationMenuTab).mockReturnValue(salesTab);

    renderTabSwitcher();

    await userEvent.click(screen.getByRole('button', { name: 'Sales' }));

    await userEvent.click(await screen.findByText('Customize sidebar'));

    expect(mockEnterLayoutCustomizationMode).toHaveBeenCalledTimes(1);
    expect(mockSwitchToNavigationMenuTab).not.toHaveBeenCalled();
  });

  it('toggles the tab menu from the active sidebar tab button itself', async () => {
    jest
      .mocked(useWorkspaceNavigationMenuContainers)
      .mockReturnValue([salesTab]);
    jest.mocked(useActiveNavigationMenuTab).mockReturnValue(salesTab);

    renderTabSwitcher();

    const salesButton = screen.getByRole('button', { name: 'Sales' });

    expect(salesButton).toHaveAttribute('aria-haspopup', 'menu');

    await userEvent.click(salesButton);
    expect(salesButton).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(salesButton);
    expect(salesButton).toHaveAttribute('aria-expanded', 'false');
    expect(mockSwitchToNavigationMenuTab).not.toHaveBeenCalled();
  });

  it('reopens the active sidebar tab when the sidebar cannot be customized', async () => {
    mockCanCustomizeSidebar = false;
    jest
      .mocked(useWorkspaceNavigationMenuContainers)
      .mockReturnValue([salesTab]);
    jest.mocked(useActiveNavigationMenuTab).mockReturnValue(salesTab);

    renderTabSwitcher();

    await userEvent.click(screen.getByRole('button', { name: 'Sales' }));

    expect(mockSwitchToNavigationMenuTab).toHaveBeenCalledWith('sales-tab-id');
    expect(screen.queryByText('Customize sidebar')).not.toBeInTheDocument();
  });

  it('selects the active sidebar tab when its menu opens in edit mode', async () => {
    jest
      .mocked(useWorkspaceNavigationMenuContainers)
      .mockReturnValue([salesTab]);
    jest.mocked(useActiveNavigationMenuTab).mockReturnValue(salesTab);

    const { store } = renderTabSwitcher({
      isLayoutCustomizationModeEnabled: true,
    });

    await userEvent.click(screen.getByRole('button', { name: 'Sales' }));

    expect(await screen.findByText('Delete tab')).toBeInTheDocument();
    expect(store.get(selectedNavigationMenuItemIdInEditModeState.atom)).toBe(
      'sales-tab-id',
    );
    expect(mockSwitchToNavigationMenuTab).not.toHaveBeenCalled();
  });

  it('labels an unnamed sidebar tab "Tab"', () => {
    jest
      .mocked(useWorkspaceNavigationMenuContainers)
      .mockReturnValue([{ ...salesTab, name: '' }]);

    renderTabSwitcher();

    expect(screen.getByRole('button', { name: 'Tab' })).toBeInTheDocument();
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

  it.each([
    [true, 'Sales'],
    [false, 'Sales, needs your input'],
  ] as const)(
    'drops the attention from the open sidebar tab only while the drawer is expanded (expanded=%s)',
    (isExpanded, expectedName) => {
      jest
        .mocked(useIsNavigationDrawerContentExpanded)
        .mockReturnValue(isExpanded);
      jest
        .mocked(useWorkspaceNavigationMenuContainers)
        .mockReturnValue([salesTab]);
      jest.mocked(useActiveNavigationMenuTab).mockReturnValue(salesTab);
      mockChatAttention = {
        chatAttention: 'needs-input',
        unreadOpenThreadCount: 0,
        getTabChatAttention: () => 'needs-input',
      };

      renderTabSwitcher();

      expect(
        screen.getByRole('button', { name: expectedName }),
      ).toHaveAttribute('aria-current', 'true');
    },
  );

  it.each([
    [false, 'auto'],
    [true, '0px'],
  ] as const)(
    'labels the active Home tab unless the row is pinned to the bottom (pinned=%s)',
    (isPinnedToBottom, expectedLabelWidth) => {
      renderTabSwitcher({ isPinnedToBottom });

      const homeButton = screen.getByRole('button', { name: 'Home' });

      expect(homeButton).toHaveAttribute('aria-current', 'true');
      expect(screen.getByText('Home')).toHaveStyle({
        width: expectedLabelWidth,
      });
    },
  );

  it('marks Home when a chat section sits at its top level', () => {
    jest
      .mocked(useWorkspaceNavigationMenuContainers)
      .mockReturnValue([salesTab]);
    jest.mocked(useActiveNavigationMenuTab).mockReturnValue(salesTab);
    mockChatAttention = {
      chatAttention: 'unread',
      unreadOpenThreadCount: 0,
      getTabChatAttention: (tabId) => (tabId === null ? 'unread' : null),
    };

    renderTabSwitcher();

    expect(
      screen.getByRole('button', { name: 'Home, unread' }),
    ).toBeInTheDocument();
  });

  it.each([
    [true, 'Home'],
    [false, 'Home, unread'],
  ] as const)(
    'drops the attention from open Home only while the drawer is expanded (expanded=%s)',
    (isExpanded, expectedName) => {
      jest
        .mocked(useIsNavigationDrawerContentExpanded)
        .mockReturnValue(isExpanded);
      mockChatAttention = {
        chatAttention: 'unread',
        unreadOpenThreadCount: 0,
        getTabChatAttention: (tabId) => (tabId === null ? 'unread' : null),
      };

      renderTabSwitcher();

      expect(
        screen.getByRole('button', { name: expectedName }),
      ).toBeInTheDocument();
    },
  );
});
