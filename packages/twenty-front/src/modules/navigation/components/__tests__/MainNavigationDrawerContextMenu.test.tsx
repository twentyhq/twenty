import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { NavigationMenuItemType } from 'twenty-shared/types';

import { type NamedNavigationMenuItem } from '@/navigation-menu-item/common/types/NamedNavigationMenuItem';
import { MainNavigationDrawerContextMenu } from '@/navigation/components/MainNavigationDrawerContextMenu';
import { isNavigationSectionOpenFamilyState } from '@/ui/navigation/navigation-drawer/states/isNavigationSectionOpenFamilyState';

let mockCanCustomizeSidebar = true;
let mockSections: Partial<NamedNavigationMenuItem>[] = [];

jest.mock('@/navigation/hooks/useCanCustomizeSidebar', () => ({
  useCanCustomizeSidebar: () => mockCanCustomizeSidebar,
}));

jest.mock('@/navigation/hooks/useIsSettingsDrawer', () => ({
  useIsSettingsDrawer: () => false,
}));

jest.mock(
  '@/navigation-menu-item/display/hooks/useActiveNavigationMenuTab',
  () => ({
    useActiveNavigationMenuTab: () => null,
  }),
);

jest.mock(
  '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuContainers',
  () => ({
    useWorkspaceNavigationMenuContainers: () => mockSections,
  }),
);

jest.mock(
  '@/layout-customization/hooks/useEnterLayoutCustomizationMode',
  () => ({
    useEnterLayoutCustomizationMode: () => ({
      enterLayoutCustomizationMode: jest.fn(),
    }),
  }),
);

const CUSTOM_SECTION = {
  id: 'custom-section',
  type: NavigationMenuItemType.SECTION,
  name: 'Sales',
  builtInSectionKey: null,
};

const FAVORITES_SECTION = {
  id: 'favorites-section',
  type: NavigationMenuItemType.SECTION,
  name: null,
  builtInSectionKey: 'favorites',
};

const renderSidebar = () => {
  const store = createStore();

  render(
    <I18nProvider i18n={i18n}>
      <JotaiProvider store={store}>
        <MemoryRouter>
          <MainNavigationDrawerContextMenu>
            <div>Search</div>
            <a href="/objects/companies">Companies</a>
          </MainNavigationDrawerContextMenu>
        </MemoryRouter>
      </JotaiProvider>
    </I18nProvider>,
  );

  const isSectionOpen = (navigationSectionId: string) =>
    store.get(
      isNavigationSectionOpenFamilyState.atomFamily(navigationSectionId),
    );

  return { isSectionOpen };
};

describe('MainNavigationDrawerContextMenu', () => {
  beforeEach(() => {
    mockCanCustomizeSidebar = true;
    mockSections = [CUSTOM_SECTION, FAVORITES_SECTION];
    localStorage.clear();
  });

  it('should offer to customize the sidebar on right-click', async () => {
    renderSidebar();

    const isBrowserMenuShown = fireEvent.contextMenu(
      screen.getByText('Search'),
    );

    expect(isBrowserMenuShown).toBe(false);
    expect(await screen.findByText('Customize sidebar')).toBeVisible();
  });

  it('should collapse then expand every section of the tab', async () => {
    const user = userEvent.setup();
    const { isSectionOpen } = renderSidebar();

    fireEvent.contextMenu(screen.getByText('Search'));
    await user.click(await screen.findByText('Collapse all sections'));

    expect(isSectionOpen('navigation-menu-section-custom-section')).toBe(false);
    expect(isSectionOpen('Favorites')).toBe(false);

    fireEvent.contextMenu(screen.getByText('Search'));
    await user.click(await screen.findByText('Expand all sections'));

    expect(isSectionOpen('navigation-menu-section-custom-section')).toBe(true);
    expect(isSectionOpen('Favorites')).toBe(true);
  });

  it('should not offer to collapse sections when the tab has none', async () => {
    mockSections = [];
    renderSidebar();

    fireEvent.contextMenu(screen.getByText('Search'));

    expect(await screen.findByText('Customize sidebar')).toBeVisible();
    expect(screen.queryByText('Collapse all sections')).not.toBeInTheDocument();
    expect(screen.queryByText('Expand all sections')).not.toBeInTheDocument();
  });

  it('should leave the browser menu on links', () => {
    renderSidebar();

    const isBrowserMenuShown = fireEvent.contextMenu(
      screen.getByText('Companies'),
    );

    expect(isBrowserMenuShown).toBe(true);
    expect(screen.queryByText('Customize sidebar')).not.toBeInTheDocument();
  });

  it('should leave the browser menu when the sidebar cannot be customized', () => {
    mockCanCustomizeSidebar = false;
    renderSidebar();

    const isBrowserMenuShown = fireEvent.contextMenu(
      screen.getByText('Search'),
    );

    expect(isBrowserMenuShown).toBe(true);
    expect(screen.queryByText('Customize sidebar')).not.toBeInTheDocument();
  });
});
