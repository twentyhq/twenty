import { MockedProvider } from '@apollo/client/testing/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IconComment, IconHome, IconSettings } from 'twenty-ui/icon';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
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

let mockIsAiChatInboxEnabled = true;
let mockIsCustomizableSidebarEnabled = true;

jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: (featureFlagKey: string) =>
    featureFlagKey === 'IS_CUSTOMIZABLE_SIDEBAR_ENABLED'
      ? mockIsCustomizableSidebarEnabled
      : mockIsAiChatInboxEnabled,
}));

jest.mock('twenty-ui/utilities', () => ({
  ...jest.requireActual('twenty-ui/utilities'),
  useIsMobile: () => false,
}));

const mockSwitchNavigationDrawerMode = jest.fn();
const mockSwitchToNavigationMenuTab = jest.fn();

const inboxTab: NavigationMenuItem = {
  id: 'inbox-tab',
  type: NavigationMenuItemType.TAB,
  name: 'Inbox',
  icon: 'IconInbox',
  position: 0,
  createdAt: '',
  updatedAt: '',
};

const developersTab: NavigationMenuItem = {
  id: 'developers-tab',
  type: NavigationMenuItemType.TAB,
  name: 'Developers',
  icon: 'IconCode',
  position: 0,
  createdAt: '',
  updatedAt: '',
};

const triageSection: NavigationMenuItem = {
  id: 'triage-section',
  type: NavigationMenuItemType.AI_CHAT_TRIAGE,
  folderId: inboxTab.id,
  position: 0,
  createdAt: '',
  updatedAt: '',
};

const buildOpenThreadsSummaryMock = (hasUnreadOpenThread: boolean) => ({
  request: { query: GetAgentChatOpenThreadsSummaryDocument },
  delay: 0,
  result: {
    data: {
      agentChatOpenThreadsSummary: {
        __typename: 'AgentChatOpenThreadsSummary' as const,
        openThreadCount: 1,
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
  navigationMenuItems = [],
  permissionFlags = [PermissionFlagType.AI],
}: {
  isLayoutCustomizationModeEnabled?: boolean;
  hasUnreadOpenThread?: boolean;
  navigationMenuItems?: NavigationMenuItem[];
  permissionFlags?: PermissionFlagType[];
} = {}) => {
  const store = createStore();

  store.set(
    isLayoutCustomizationModeEnabledState.atom,
    isLayoutCustomizationModeEnabled,
  );
  store.set(currentUserWorkspaceState.atom, {
    ...mockedUserData.currentUserWorkspace,
    permissionFlags,
  });
  store.set(metadataStoreState.atomFamily('navigationMenuItems'), {
    current: navigationMenuItems,
    draft: [],
    status: 'up-to-date',
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
    mockIsAiChatInboxEnabled = true;
    mockIsCustomizableSidebarEnabled = true;

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

    await userEvent.click(screen.getByRole('button', { name: 'AI' }));

    expect(mockSwitchNavigationDrawerMode).toHaveBeenCalledTimes(1);
    expect(mockSwitchNavigationDrawerMode).toHaveBeenCalledWith(
      NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY,
    );
  });

  it.each([
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
      const modeButton = screen.getByRole('button', { name: label });

      expect(modeButton).toHaveAttribute('aria-disabled', 'true');
      expect(screen.getByRole('button', { name: 'Home' })).toBeEnabled();
      expect(screen.getByRole('button', { name: 'Home' })).toHaveAttribute(
        'aria-disabled',
        'false',
      );

      await userEvent.click(modeButton);
      expect(modeButton).toHaveFocus();
      await userEvent.keyboard('{Enter} ');

      expect(mockSwitchNavigationDrawerMode).not.toHaveBeenCalled();

      act(() => {
        store.set(isLayoutCustomizationModeEnabledState.atom, false);
      });

      expect(modeButton).toHaveAttribute('aria-disabled', 'false');
      await userEvent.click(modeButton);

      expect(mockSwitchNavigationDrawerMode).toHaveBeenCalledTimes(1);
      expect(mockSwitchNavigationDrawerMode).toHaveBeenCalledWith(mode);
    },
  );

  it('shows the Settings mode and no Add tab while the customizable sidebar is off', () => {
    mockIsCustomizableSidebarEnabled = false;

    renderModeSwitcher({ isLayoutCustomizationModeEnabled: true });

    const buttonNames = screen
      .getAllByRole('button')
      .map((button) => button.getAttribute('aria-label'));

    expect(buttonNames).toEqual(['Home', 'AI', 'Settings']);
  });

  it('lists custom tabs after the leading modes and opens them', async () => {
    jest
      .mocked(useWorkspaceNavigationMenuTabs)
      .mockReturnValue([developersTab]);

    renderModeSwitcher();

    const buttonNames = screen
      .getAllByRole('button')
      .map((button) => button.getAttribute('aria-label'));

    expect(buttonNames).toEqual(['Home', 'AI', 'Developers']);

    await userEvent.click(screen.getByRole('button', { name: 'Developers' }));

    expect(mockSwitchToNavigationMenuTab).toHaveBeenCalledWith(
      developersTab.id,
    );
  });

  it('returns Home from a custom tab', async () => {
    jest
      .mocked(useWorkspaceNavigationMenuTabs)
      .mockReturnValue([developersTab]);
    jest.mocked(useActiveNavigationMenuTab).mockReturnValue(developersTab);

    renderModeSwitcher();

    expect(screen.getByRole('button', { name: 'Developers' })).toHaveAttribute(
      'aria-current',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Home' })).not.toHaveAttribute(
      'aria-current',
    );

    await userEvent.click(screen.getByRole('button', { name: 'Home' }));

    expect(mockSwitchToNavigationMenuTab).toHaveBeenCalledWith(null);
  });

  it('opens the tab holding the chat sections like any other tab', async () => {
    jest
      .mocked(useWorkspaceNavigationMenuTabs)
      .mockReturnValue([inboxTab, developersTab]);

    renderModeSwitcher({ navigationMenuItems: [triageSection] });

    expect(
      screen
        .getAllByRole('button')
        .map((button) => button.getAttribute('aria-label')),
    ).toEqual(['Home', 'Inbox', 'Developers']);

    await userEvent.click(screen.getByRole('button', { name: 'Inbox' }));

    expect(mockSwitchToNavigationMenuTab).toHaveBeenCalledWith(inboxTab.id);
    expect(mockSwitchNavigationDrawerMode).not.toHaveBeenCalled();
  });

  it.each([
    ['chat', NavigationMenuItemType.AI_CHAT_TRIAGE],
    ['agents', NavigationMenuItemType.AI_AGENTS],
  ] as const)(
    'hides a tab holding only %s sections from members without AI access',
    (_, sectionType) => {
      jest
        .mocked(useWorkspaceNavigationMenuTabs)
        .mockReturnValue([inboxTab, developersTab]);

      renderModeSwitcher({
        navigationMenuItems: [{ ...triageSection, type: sectionType }],
        permissionFlags: [],
      });

      expect(
        screen.queryByRole('button', { name: 'Inbox' }),
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Developers' }),
      ).toBeInTheDocument();
    },
  );

  it('offers to add a tab only while editing the layout', () => {
    renderModeSwitcher();

    expect(
      screen.queryByRole('button', { name: 'Add tab' }),
    ).not.toBeInTheDocument();
  });

  it.each([
    { tabs: [inboxTab, developersTab], addTabButtonCount: 1 },
    {
      tabs: [
        inboxTab,
        developersTab,
        { ...developersTab, id: 'reports-tab', name: 'Reports' },
      ],
      addTabButtonCount: 0,
    },
  ])(
    'caps the row at four tabs counting Home ($tabs.length custom tabs)',
    ({ tabs, addTabButtonCount }) => {
      jest.mocked(useWorkspaceNavigationMenuTabs).mockReturnValue(tabs);

      renderModeSwitcher({
        isLayoutCustomizationModeEnabled: true,
        navigationMenuItems: [triageSection],
      });

      expect(screen.queryAllByRole('button', { name: 'Add tab' })).toHaveLength(
        addTabButtonCount,
      );
    },
  );

  it('keeps custom tabs reachable while editing the layout', async () => {
    jest
      .mocked(useWorkspaceNavigationMenuTabs)
      .mockReturnValue([developersTab]);

    renderModeSwitcher({ isLayoutCustomizationModeEnabled: true });

    expect(screen.getByRole('button', { name: 'Add tab' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Developers' }));

    expect(mockSwitchToNavigationMenuTab).toHaveBeenCalledWith(
      developersTab.id,
    );
  });

  it('marks the inbox while one of its open chats is unread', async () => {
    renderModeSwitcher({ hasUnreadOpenThread: true });

    expect(
      await screen.findByRole('button', { name: 'AI, unread' }),
    ).toBeInTheDocument();
  });

  it.each([
    ['Inbox', inboxTab.id],
    ['Home', null],
  ] as const)(
    'marks %s while the triage it holds has an unread open chat',
    async (label, triageParentId) => {
      jest
        .mocked(useWorkspaceNavigationMenuTabs)
        .mockReturnValue([inboxTab, developersTab]);
      jest.mocked(useActiveNavigationMenuTab).mockReturnValue(developersTab);

      renderModeSwitcher({
        hasUnreadOpenThread: true,
        navigationMenuItems: [{ ...triageSection, folderId: triageParentId }],
      });

      expect(
        await screen.findByRole('button', { name: `${label}, unread` }),
      ).toBeInTheDocument();
    },
  );

  it('does not mark the inbox when its open chats are read', async () => {
    renderModeSwitcher();
    await waitForOpenThreadsSummary();

    expect(screen.getByRole('button', { name: 'AI' })).toBeInTheDocument();
  });

  it('does not mark unread chats while the inbox feature flag is off', async () => {
    mockIsAiChatInboxEnabled = false;
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
});
