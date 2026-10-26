import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { ToastProvider } from 'twenty-ui/components/feedback';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { MainNavigationDrawerContextMenu } from '@/navigation/components/MainNavigationDrawerContextMenu';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { mockedUserData } from '~/testing/mock-data/users';

jest.mock('twenty-ui/utilities', () => ({
  ...jest.requireActual('twenty-ui/utilities'),
  useIsMobile: () => false,
}));

const renderSidebar = (permissionFlags: PermissionFlagType[]) => {
  const store = createStore();

  store.set(currentUserWorkspaceState.atom, {
    ...mockedUserData.currentUserWorkspace,
    permissionFlags,
  });
  store.set(metadataStoreState.atomFamily('navigationMenuItems'), {
    current: [
      {
        id: 'workspace-section',
        type: NavigationMenuItemType.SECTION,
        name: 'Workspace',
        position: 0,
        createdAt: '',
        updatedAt: '',
      },
    ],
    draft: [],
    status: 'up-to-date',
  });

  render(
    <I18nProvider i18n={i18n}>
      <JotaiProvider store={store}>
        <MemoryRouter>
          <ToastProvider>
            <MainNavigationDrawerContextMenu>
              <div>Search</div>
              <div data-navigation-menu-section-id="workspace-section">
                <span>Workspace</span>
                <a href="/objects/companies">Companies</a>
              </div>
            </MainNavigationDrawerContextMenu>
          </ToastProvider>
        </MemoryRouter>
      </JotaiProvider>
    </I18nProvider>,
  );
};

describe('MainNavigationDrawerContextMenu', () => {
  it('offers to customize the sidebar on right-click', async () => {
    renderSidebar([PermissionFlagType.LAYOUTS]);

    const isBrowserMenuShown = fireEvent.contextMenu(
      screen.getByText('Search'),
    );

    expect(isBrowserMenuShown).toBe(false);
    expect(await screen.findByText('Customize sidebar')).toBeVisible();
  });

  it('offers to add an item to the right-clicked section', async () => {
    renderSidebar([PermissionFlagType.LAYOUTS]);

    fireEvent.contextMenu(screen.getByText('Workspace'));

    expect(await screen.findByText('Add item to Workspace')).toBeVisible();
  });

  it('only offers to add an item when right-clicking inside a section', async () => {
    renderSidebar([PermissionFlagType.LAYOUTS]);

    fireEvent.contextMenu(screen.getByText('Search'));

    expect(await screen.findByText('Add section')).toBeVisible();
    expect(screen.queryByText(/Add item to/)).not.toBeInTheDocument();
  });

  it('leaves the browser menu on links', () => {
    renderSidebar([PermissionFlagType.LAYOUTS]);

    const isBrowserMenuShown = fireEvent.contextMenu(
      screen.getByText('Companies'),
    );

    expect(isBrowserMenuShown).toBe(true);
    expect(screen.queryByText('Customize sidebar')).not.toBeInTheDocument();
  });

  it('leaves the browser menu for members who cannot edit layouts', () => {
    renderSidebar([]);

    const isBrowserMenuShown = fireEvent.contextMenu(
      screen.getByText('Search'),
    );

    expect(isBrowserMenuShown).toBe(true);
    expect(screen.queryByText('Customize sidebar')).not.toBeInTheDocument();
  });
});
