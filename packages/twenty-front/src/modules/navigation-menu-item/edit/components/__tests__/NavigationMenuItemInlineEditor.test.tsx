import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { useContext } from 'react';
import { NavigationMenuItemType } from 'twenty-shared/types';

import { navigationMenuItemIdToRenameState } from '@/navigation-menu-item/common/states/navigationMenuItemIdToRenameState';
import { selectedNavigationMenuItemIdInEditModeState } from '@/navigation-menu-item/common/states/selectedNavigationMenuItemIdInEditModeState';
import { NavigationMenuItemInlineEditor } from '@/navigation-menu-item/edit/components/NavigationMenuItemInlineEditor';
import { NavigationDrawerItemEditingContext } from '@/ui/navigation/navigation-drawer/contexts/NavigationDrawerItemEditingContext';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

const mockUpdateItem = jest.fn();

jest.mock(
  '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController',
  () => ({
    useNavigationMenuItemEditController: () => ({
      updateItem: mockUpdateItem,
    }),
  }),
);

const FOLDER: NavigationMenuItem = {
  id: 'folder',
  type: NavigationMenuItemType.FOLDER,
  name: 'New folder',
  position: 0,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const EditingLabel = () => {
  const editingContent = useContext(NavigationDrawerItemEditingContext);

  return <>{editingContent?.label}</>;
};

describe('NavigationMenuItemInlineEditor', () => {
  beforeEach(() => {
    mockUpdateItem.mockClear();
    jotaiStore.set(selectedNavigationMenuItemIdInEditModeState.atom, FOLDER.id);
    jotaiStore.set(navigationMenuItemIdToRenameState.atom, FOLDER.id);
    jotaiStore.set(isNavigationDrawerExpandedState.atom, true);
  });

  it('keeps spaces typed in a folder name', async () => {
    const user = userEvent.setup();
    render(
      <I18nProvider i18n={i18n}>
        <JotaiProvider store={jotaiStore}>
          <NavigationMenuItemInlineEditor
            item={FOLDER}
            dropdownId="navigation-item-folder"
            rowAnchorId="navigation-item-anchor-folder"
            onEditLink={jest.fn()}
          >
            <EditingLabel />
          </NavigationMenuItemInlineEditor>
        </JotaiProvider>
      </I18nProvider>,
    );

    const input = await screen.findByDisplayValue('New folder');
    await user.clear(input);
    await user.type(input, 'QA Space Test');

    expect(input).toHaveValue('QA Space Test');

    await user.type(input, '  {Enter}');

    expect(mockUpdateItem).toHaveBeenCalledWith(FOLDER.id, {
      name: 'QA Space Test',
    });
  });
});
