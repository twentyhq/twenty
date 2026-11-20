import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';

import { NavigationMenuAddSectionButton } from '@/navigation-menu-item/edit/components/NavigationMenuAddSectionButton';

jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: () => true,
}));

jest.mock(
  '@/navigation-menu-item/display/hooks/useAreAiChatSectionsAvailable',
  () => ({ useAreAiChatSectionsAvailable: () => true }),
);

jest.mock(
  '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData',
  () => ({
    useNavigationMenuItemsData: () => ({ workspaceNavigationMenuItems: [] }),
  }),
);

jest.mock(
  '@/navigation-menu-item/edit/hooks/useHiddenNavigationMenuItemsInTab',
  () => ({ useHiddenNavigationMenuItemsInTab: () => [] }),
);

jest.mock(
  '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController',
  () => ({
    useNavigationMenuItemEditController: () => ({ createItem: jest.fn() }),
  }),
);

jest.mock(
  '@/navigation-menu-item/edit/components/NavigationMenuAddSectionHiddenItems',
  () => ({ NavigationMenuAddSectionHiddenItems: () => null }),
);

const renderAddSectionButton = () =>
  render(
    <I18nProvider i18n={i18n}>
      <JotaiProvider store={createStore()}>
        <NavigationMenuAddSectionButton containerId="sales-tab-id" />
      </JotaiProvider>
    </I18nProvider>,
  );

describe('NavigationMenuAddSectionButton', () => {
  it('lists the built-in sections before Custom section', async () => {
    const user = userEvent.setup();

    renderAddSectionButton();

    await user.click(screen.getByText('Add section'));

    const menuItemLabels = (await screen.findAllByRole('menuitem')).map(
      (menuItem) => menuItem.textContent,
    );

    expect(menuItemLabels[0]).toBe('Favorites');
    expect(menuItemLabels.at(-1)).toBe('Custom section');
  });

  it('toggles the menu from the label', async () => {
    const user = userEvent.setup();

    renderAddSectionButton();

    await user.click(screen.getByText('Add section'));
    expect(await screen.findByRole('menu')).toBeInTheDocument();

    await user.click(screen.getByText('Add section'));
    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
    );
  });
});
