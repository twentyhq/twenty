import { MockedProvider } from '@apollo/client/testing/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { ToastProvider } from 'twenty-ui/components/feedback';
import { MemoryRouter } from 'react-router-dom';
import { NavigationMenuItemType } from 'twenty-shared/types';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { buildOptimisticNavigationMenuItem } from '@/navigation-menu-item/common/utils/buildOptimisticNavigationMenuItem';
import { NavigationMenuItemAddSectionButton } from '@/navigation-menu-item/edit/components/NavigationMenuItemAddSectionButton';
import {
  type NavigationMenuItem,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { mockedUserData } from '~/testing/mock-data/users';

const renderAddSectionButton = (
  permissionFlags: PermissionFlagType[],
  navigationMenuItems: NavigationMenuItem[] = [],
) => {
  const store = createStore();

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
        <MockedProvider>
          <ToastProvider>
            <MemoryRouter>
              <NavigationMenuItemAddSectionButton parentId={null} />
            </MemoryRouter>
          </ToastProvider>
        </MockedProvider>
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

  it('only offers the sections the tab does not have yet, then Custom section', async () => {
    renderAddSectionButton(
      [PermissionFlagType.AI],
      [
        buildOptimisticNavigationMenuItem({
          id: 'favorites-section',
          type: NavigationMenuItemType.FAVORITES,
        }),
      ],
    );

    await userEvent.click(screen.getByText('Add section'));

    expect(
      (await screen.findAllByRole('menuitem')).map((item) => item.textContent),
    ).toEqual([
      'Inbox',
      'Favorite chats',
      'Channels',
      'Recent chats',
      'Agents',
      'Custom section',
    ]);
  });
});
