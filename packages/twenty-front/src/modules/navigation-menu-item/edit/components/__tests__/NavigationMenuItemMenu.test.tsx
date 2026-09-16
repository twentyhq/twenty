import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';

import { openNavigationMenuItemFolderIdsState } from '@/navigation-menu-item/common/states/openNavigationMenuItemFolderIdsState';
import { NavigationMenuItemMenu } from '@/navigation-menu-item/edit/components/NavigationMenuItemMenu';

jest.mock(
  '@/navigation-menu-item/edit/components/NavigationMenuItemAddDropdownContent',
  () => ({
    NavigationMenuItemAddDropdownContent: ({
      onClose,
    }: {
      onClose: () => void;
    }) => <button onClick={onClose}>Close picker</button>,
  }),
);

describe('NavigationMenuItemMenu', () => {
  it.each(['favorite', 'workspace'] as const)(
    'replaces %s actions with the picker and resets when closed',
    async (section) => {
      const user = userEvent.setup();
      const store = createStore();
      render(
        <I18nProvider i18n={i18n}>
          <Provider store={store}>
            <NavigationMenuItemMenu
              dropdownId="folder-actions"
              section={section}
              clickableComponent={<span>Folder actions</span>}
              renderMenu={({ onAdd }) => (
                <button
                  onClick={() => onAdd({ folderId: 'folder', position: 1 })}
                >
                  Add menu item
                </button>
              )}
            />
          </Provider>
        </I18nProvider>,
      );

      await user.click(screen.getByRole('button', { name: 'Folder actions' }));
      await user.click(screen.getByRole('button', { name: 'Add menu item' }));
      expect(
        screen.queryByRole('button', { name: 'Add menu item' }),
      ).not.toBeInTheDocument();
      expect(store.get(openNavigationMenuItemFolderIdsState.atom)).toContain(
        'folder',
      );
      await user.click(screen.getByRole('button', { name: 'Close picker' }));
      expect(
        screen.queryByRole('button', { name: 'Close picker' }),
      ).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Folder actions' }));
      expect(
        screen.getByRole('button', { name: 'Add menu item' }),
      ).toBeVisible();
      expect(
        screen.queryByRole('button', { name: 'Close picker' }),
      ).not.toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Add menu item' }));
      await user.keyboard('{Escape}');
      expect(
        screen.queryByRole('button', { name: 'Close picker' }),
      ).not.toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Folder actions' }));
      expect(
        screen.getByRole('button', { name: 'Add menu item' }),
      ).toBeVisible();
    },
  );
});
