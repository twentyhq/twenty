import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { NavigationMenuItemType } from 'twenty-shared/types';

import { navigationMenuSectionIdToAddItemState } from '@/navigation-menu-item/common/states/navigationMenuSectionIdToAddItemState';
import { type NamedNavigationMenuItem } from '@/navigation-menu-item/common/types/NamedNavigationMenuItem';
import { MainNavigationDrawerContextMenu } from '@/navigation/components/MainNavigationDrawerContextMenu';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { isNavigationSectionOpenFamilyState } from '@/ui/navigation/navigation-drawer/states/isNavigationSectionOpenFamilyState';

let mockSections: Partial<NamedNavigationMenuItem>[] = [];
const mockEnterLayoutCustomizationMode = jest.fn();

jest.mock('@/navigation/hooks/useCanCustomizeSidebar', () => ({
  useCanCustomizeSidebar: () => true,
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
      enterLayoutCustomizationMode: mockEnterLayoutCustomizationMode,
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
            <div data-navigation-menu-section-id="custom-section">
              <span>Sales</span>
            </div>
            <div data-navigation-menu-section-id="favorites-section">
              <span>Favorites</span>
            </div>
          </MainNavigationDrawerContextMenu>
        </MemoryRouter>
      </JotaiProvider>
    </I18nProvider>,
  );

  const isSectionOpen = (navigationSectionId: string) =>
    store.get(
      isNavigationSectionOpenFamilyState.atomFamily(navigationSectionId),
    );

  const getSectionIdToAddItem = () =>
    store.get(navigationMenuSectionIdToAddItemState.atom);

  const isDropdownOpen = (dropdownId: string) =>
    store.get(
      isDropdownOpenComponentState.atomFamily({ instanceId: dropdownId }),
    );

  return { isSectionOpen, getSectionIdToAddItem, isDropdownOpen };
};

describe('MainNavigationDrawerContextMenu', () => {
  beforeEach(() => {
    mockSections = [CUSTOM_SECTION, FAVORITES_SECTION];
    mockEnterLayoutCustomizationMode.mockReset().mockReturnValue(true);
    localStorage.clear();
  });

  it('should add an item to the right-clicked section in edit mode', async () => {
    const user = userEvent.setup();
    const { getSectionIdToAddItem } = renderSidebar();

    fireEvent.contextMenu(screen.getByText('Sales'));
    await user.click(await screen.findByText('Add item to Sales'));

    expect(mockEnterLayoutCustomizationMode).toHaveBeenCalled();
    expect(getSectionIdToAddItem()).toBe('custom-section');
  });

  it('should only offer to add an item inside a custom section', async () => {
    renderSidebar();

    fireEvent.contextMenu(screen.getByText('Search'));
    expect(await screen.findByText('Add section')).toBeVisible();
    expect(screen.queryByText(/Add item to/)).not.toBeInTheDocument();
  });

  it('should not offer to add an item to a built-in section', async () => {
    renderSidebar();

    fireEvent.contextMenu(screen.getByText('Favorites'));
    expect(await screen.findByText('Add section')).toBeVisible();
    expect(screen.queryByText(/Add item to/)).not.toBeInTheDocument();
  });

  it('should open the add section menu in edit mode', async () => {
    const user = userEvent.setup();
    const { isDropdownOpen } = renderSidebar();

    fireEvent.contextMenu(screen.getByText('Search'));
    await user.click(await screen.findByText('Add section'));

    expect(mockEnterLayoutCustomizationMode).toHaveBeenCalled();
    expect(isDropdownOpen('navigation-menu-add-section-home')).toBe(true);
  });

  it('should open nothing when edit mode is refused', async () => {
    mockEnterLayoutCustomizationMode.mockReturnValue(false);
    const user = userEvent.setup();
    const { getSectionIdToAddItem, isDropdownOpen } = renderSidebar();

    fireEvent.contextMenu(screen.getByText('Sales'));
    await user.click(await screen.findByText('Add item to Sales'));
    fireEvent.contextMenu(screen.getByText('Search'));
    await user.click(await screen.findByText('Add section'));

    expect(getSectionIdToAddItem()).toBeNull();
    expect(isDropdownOpen('navigation-menu-add-section-home')).toBe(false);
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
});
