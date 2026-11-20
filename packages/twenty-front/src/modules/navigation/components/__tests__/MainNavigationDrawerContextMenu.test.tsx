import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { NavigationMenuItemType } from 'twenty-shared/types';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { type NamedNavigationMenuItem } from '@/navigation-menu-item/common/types/NamedNavigationMenuItem';
import { navigationMenuSectionIdAddingItemState } from '@/navigation-menu-item/common/states/navigationMenuSectionIdAddingItemState';
import { useActiveNavigationMenuTab } from '@/navigation-menu-item/display/hooks/useActiveNavigationMenuTab';
import { useWorkspaceNavigationMenuContainers } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuContainers';
import { MainNavigationDrawerContextMenu } from '@/navigation/components/MainNavigationDrawerContextMenu';
import { isNavigationSectionOpenFamilyState } from '@/ui/navigation/navigation-drawer/states/isNavigationSectionOpenFamilyState';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { mockedUserData } from '~/testing/mock-data/users';

let mockIsCustomizableSidebarEnabled = true;
const mockEnterLayoutCustomizationMode = jest.fn(() => true);

jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: () => mockIsCustomizableSidebarEnabled,
}));

jest.mock(
  '@/layout-customization/hooks/useEnterLayoutCustomizationMode',
  () => ({
    useEnterLayoutCustomizationMode: () => ({
      enterLayoutCustomizationMode: mockEnterLayoutCustomizationMode,
    }),
  }),
);

jest.mock('@/navigation-menu-item/display/hooks/useActiveNavigationMenuTab');
jest.mock(
  '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuContainers',
);

jest.mock('twenty-ui/utilities', () => ({
  ...jest.requireActual('twenty-ui/utilities'),
  useIsMobile: () => false,
}));

const WORKSPACE_SECTION: NamedNavigationMenuItem = {
  id: 'workspace-section-id',
  type: NavigationMenuItemType.SECTION,
  name: 'Workspace',
  position: 0,
  isActive: true,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

const renderSidebar = (permissionFlags: PermissionFlagType[]) => {
  const store = createStore();

  store.set(currentUserWorkspaceState.atom, {
    ...mockedUserData.currentUserWorkspace,
    permissionFlags,
  });

  render(
    <I18nProvider i18n={i18n}>
      <JotaiProvider store={store}>
        <MemoryRouter>
          <MainNavigationDrawerContextMenu>
            <div>Search</div>
            <div data-navigation-menu-section-id={WORKSPACE_SECTION.id}>
              <span>Workspace title</span>
              <a href="/objects/companies">Companies</a>
            </div>
          </MainNavigationDrawerContextMenu>
        </MemoryRouter>
      </JotaiProvider>
    </I18nProvider>,
  );

  return { store };
};

describe('MainNavigationDrawerContextMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsCustomizableSidebarEnabled = true;
    jest.mocked(useActiveNavigationMenuTab).mockReturnValue(null);
    jest
      .mocked(useWorkspaceNavigationMenuContainers)
      .mockReturnValue([WORKSPACE_SECTION]);
  });

  it('offers to customize the sidebar on right-click', async () => {
    renderSidebar([PermissionFlagType.LAYOUTS]);

    const isBrowserMenuShown = fireEvent.contextMenu(
      screen.getByText('Search'),
    );

    expect(isBrowserMenuShown).toBe(false);

    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'Customize sidebar' }),
    );

    expect(mockEnterLayoutCustomizationMode).toHaveBeenCalledTimes(1);
  });

  it('offers Add section everywhere but Add item only inside a section', async () => {
    renderSidebar([PermissionFlagType.LAYOUTS]);

    fireEvent.contextMenu(screen.getByText('Search'));

    expect(
      await screen.findByRole('menuitem', { name: 'Add section' }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Add item to/)).not.toBeInTheDocument();
  });

  it('opens the add item picker of the right-clicked section', async () => {
    const { store } = renderSidebar([PermissionFlagType.LAYOUTS]);

    fireEvent.contextMenu(screen.getByText('Workspace title'));
    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'Add item to Workspace' }),
    );

    expect(mockEnterLayoutCustomizationMode).toHaveBeenCalledTimes(1);
    expect(store.get(navigationMenuSectionIdAddingItemState.atom)).toBe(
      WORKSPACE_SECTION.id,
    );
  });

  it('collapses and expands every section of the tab', async () => {
    const { store } = renderSidebar([PermissionFlagType.LAYOUTS]);
    const workspaceSectionOpenState =
      isNavigationSectionOpenFamilyState.atomFamily(
        `navigation-menu-section-${WORKSPACE_SECTION.id}`,
      );
    const favoritesSectionOpenState =
      isNavigationSectionOpenFamilyState.atomFamily('Favorites');

    fireEvent.contextMenu(screen.getByText('Search'));
    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'Collapse all sections' }),
    );

    expect(store.get(workspaceSectionOpenState)).toBe(false);
    expect(store.get(favoritesSectionOpenState)).toBe(false);

    fireEvent.contextMenu(screen.getByText('Search'));
    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'Expand all sections' }),
    );

    expect(store.get(workspaceSectionOpenState)).toBe(true);
    expect(store.get(favoritesSectionOpenState)).toBe(true);
  });

  it('leaves the browser menu on links', () => {
    renderSidebar([PermissionFlagType.LAYOUTS]);

    const isBrowserMenuShown = fireEvent.contextMenu(
      screen.getByText('Companies'),
    );

    expect(isBrowserMenuShown).toBe(true);
  });

  it('leaves the browser menu while the customizable sidebar is off', () => {
    mockIsCustomizableSidebarEnabled = false;
    renderSidebar([PermissionFlagType.LAYOUTS]);

    expect(fireEvent.contextMenu(screen.getByText('Search'))).toBe(true);
  });

  it('leaves the browser menu for members who cannot edit layouts', () => {
    renderSidebar([]);

    expect(fireEvent.contextMenu(screen.getByText('Search'))).toBe(true);
  });
});
