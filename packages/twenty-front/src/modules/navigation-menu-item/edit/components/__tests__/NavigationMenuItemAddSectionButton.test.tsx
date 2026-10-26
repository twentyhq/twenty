import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { NavigationMenuItemAddSectionButton } from '@/navigation-menu-item/edit/components/NavigationMenuItemAddSectionButton';
import { type PermissionFlagType } from '~/generated-metadata/graphql';
import { mockedUserData } from '~/testing/mock-data/users';

const renderAddSectionButton = (permissionFlags: PermissionFlagType[]) => {
  const store = createStore();

  store.set(currentUserWorkspaceState.atom, {
    ...mockedUserData.currentUserWorkspace,
    permissionFlags,
  });

  render(
    <I18nProvider i18n={i18n}>
      <JotaiProvider store={store}>
        <MemoryRouter>
          <NavigationMenuItemAddSectionButton parentId={null} />
        </MemoryRouter>
      </JotaiProvider>
    </I18nProvider>,
  );
};

describe('NavigationMenuItemAddSectionButton', () => {
  it('offers the Favorites section to members without AI access', async () => {
    renderAddSectionButton([]);

    await userEvent.click(screen.getByText('Add section'));

    expect(await screen.findByText('Favorites')).toBeVisible();
    expect(screen.queryByText('Inbox')).not.toBeInTheDocument();
  });
});
