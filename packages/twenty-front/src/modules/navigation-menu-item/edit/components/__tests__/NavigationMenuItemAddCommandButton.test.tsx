import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import {
  type NavigationMenuItemCommandKey,
  NavigationMenuItemType,
} from 'twenty-shared/types';

import { buildOptimisticNavigationMenuItem } from '@/navigation-menu-item/common/utils/buildOptimisticNavigationMenuItem';
import { NavigationMenuItemAddCommandButton } from '@/navigation-menu-item/edit/components/NavigationMenuItemAddCommandButton';

jest.mock(
  '@/navigation-menu-item/display/command/hooks/useNavigationMenuItemCommandRunner',
  () => ({
    useNavigationMenuItemCommandRunner: () => ({
      isCommandAvailable: () => true,
    }),
  }),
);

jest.mock(
  '@/navigation-menu-item/edit/hooks/useCreateNavigationMenuTabOrSection',
  () => ({
    useCreateNavigationMenuTabOrSection: () => ({ pinCommand: jest.fn() }),
  }),
);

const renderAddCommandButton = (
  pinnedCommandKeys: NavigationMenuItemCommandKey[],
) =>
  render(
    <I18nProvider i18n={i18n}>
      <JotaiProvider store={createStore()}>
        <MemoryRouter>
          <NavigationMenuItemAddCommandButton
            commandItems={pinnedCommandKeys.map((commandKey, position) =>
              buildOptimisticNavigationMenuItem({
                id: commandKey,
                type: NavigationMenuItemType.COMMAND,
                commandKey,
                position,
              }),
            )}
          />
        </MemoryRouter>
      </JotaiProvider>
    </I18nProvider>,
  );

describe('NavigationMenuItemAddCommandButton', () => {
  it('explains instead of opening the picker once every command is pinned', async () => {
    renderAddCommandButton(['NEW_CHAT', 'SEARCH', 'SETTINGS', 'ALL_COMMANDS']);

    await userEvent.hover(screen.getByText('Add command'));

    expect(
      await screen.findByText('All commands are already in the sidebar'),
    ).toBeVisible();

    await userEvent.click(screen.getByText('Add command'));

    expect(screen.queryByText('Already in sidebar')).not.toBeInTheDocument();
  });

  it('opens the picker while a command is not pinned yet', async () => {
    renderAddCommandButton(['NEW_CHAT', 'SEARCH', 'SETTINGS']);

    await userEvent.click(screen.getByText('Add command'));

    expect(await screen.findByText('All commands')).toBeVisible();
  });
});
