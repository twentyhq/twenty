import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from 'twenty-ui/components/feedback';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
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

  render(
    <I18nProvider i18n={i18n}>
      <JotaiProvider store={store}>
        <MemoryRouter>
          <ToastProvider>
            <MainNavigationDrawerContextMenu>
              <div>Search</div>
              <a href="/objects/companies">Companies</a>
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
