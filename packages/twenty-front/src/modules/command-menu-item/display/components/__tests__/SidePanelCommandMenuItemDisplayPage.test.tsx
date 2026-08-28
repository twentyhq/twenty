import { EMPTY_COMMAND_MENU_CONTEXT_API } from '@/command-menu-item/constants/EmptyCommandMenuContextApi';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { SidePanelCommandMenuItemDisplayPage } from '@/command-menu-item/display/components/SidePanelCommandMenuItemDisplayPage';
import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { navigationDrawerActiveTabState } from '@/ui/navigation/states/navigationDrawerActiveTabState';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';

const mockCloseSidePanelMenu = jest.fn();
let mockIsMobile = false;

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({ closeSidePanelMenu: mockCloseSidePanelMenu }),
}));

jest.mock('@/ui/utilities/responsive/hooks/useIsMobile', () => ({
  useIsMobile: () => mockIsMobile,
}));

jest.mock(
  '@/command-menu-item/display/components/CommandMenuItemRenderer',
  () => ({ CommandMenuItemRenderer: () => null }),
);

const renderCommandMenu = ({
  search = '',
  isExpanded = true,
  isInPreviewMode = false,
  pathname = '/objects/companies',
} = {}) => {
  const store = createStore();

  store.set(sidePanelSearchState.atom, search);
  store.set(isNavigationDrawerExpandedState.atom, isExpanded);
  store.set(
    navigationDrawerActiveTabState.atom,
    NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY,
  );

  render(
    <Provider store={store}>
      <I18nProvider i18n={i18n}>
        <MemoryRouter initialEntries={[pathname]}>
          <CommandMenuContext.Provider
            value={{
              displayType: 'listItem',
              containerType: CommandMenuItemContainerType.CommandMenuList,
              commandMenuItems: [],
              commandMenuContextApi: EMPTY_COMMAND_MENU_CONTEXT_API,
              isInPreviewMode,
            }}
          >
            <SidePanelCommandMenuItemDisplayPage />
          </CommandMenuContext.Provider>
        </MemoryRouter>
      </I18nProvider>
    </Provider>,
  );

  return { store };
};

describe('navigation drawer command', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    mockIsMobile = false;
  });

  it('collapses the drawer, restores navigation, and closes the command menu', async () => {
    const user = userEvent.setup();
    const { store } = renderCommandMenu();

    await user.click(screen.getByText('Collapse navigation drawer'));

    expect(store.get(isNavigationDrawerExpandedState.atom)).toBe(false);
    expect(store.get(navigationDrawerActiveTabState.atom)).toBe(
      NAVIGATION_DRAWER_TABS.NAVIGATION_MENU,
    );
    expect(mockCloseSidePanelMenu).toHaveBeenCalledTimes(1);
  });

  it('offers the expand command when the drawer is collapsed', async () => {
    const user = userEvent.setup();
    const { store } = renderCommandMenu({ isExpanded: false });

    expect(screen.queryByText('Collapse navigation drawer')).toBeNull();

    await user.click(screen.getByText('Expand navigation drawer'));

    expect(store.get(isNavigationDrawerExpandedState.atom)).toBe(true);
    expect(mockCloseSidePanelMenu).toHaveBeenCalledTimes(1);
  });

  it.each(['COLLAPSE', 'navigation', ' drawer '])(
    'finds the command when searching for %s',
    (search) => {
      renderCommandMenu({ search });

      expect(screen.getByText('Collapse navigation drawer')).toBeVisible();
      expect(screen.queryByText('No results found')).toBeNull();
    },
  );

  it('does not show the command for an unrelated search', () => {
    renderCommandMenu({ search: 'unrelated search' });

    expect(screen.queryByText('Collapse navigation drawer')).toBeNull();
    expect(screen.getByText('No results found')).toBeVisible();
  });

  it('does not show a drawer command on mobile', () => {
    mockIsMobile = true;
    renderCommandMenu();

    expect(screen.queryByText('Collapse navigation drawer')).toBeNull();
  });

  it('does not show a drawer command in settings', () => {
    renderCommandMenu({ pathname: '/settings/profile' });

    expect(screen.queryByText('Collapse navigation drawer')).toBeNull();
  });

  it('does not show a drawer command in layout preview', () => {
    renderCommandMenu({ isInPreviewMode: true });

    expect(screen.queryByText('Collapse navigation drawer')).toBeNull();
  });
});
