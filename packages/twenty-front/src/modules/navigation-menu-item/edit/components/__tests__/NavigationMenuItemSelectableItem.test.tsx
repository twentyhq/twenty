import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';

import { NavigationMenuItemSelectableItem } from '@/navigation-menu-item/edit/components/NavigationMenuItemSelectableItem';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';

const FOCUS_ID = 'navigation-menu-item-selectable-item-test';

describe('NavigationMenuItemSelectableItem', () => {
  it('ignores Enter and clicks on a disabled destination', async () => {
    const user = userEvent.setup();
    const store = createStore();
    const chooseUnavailableDestination = jest.fn();
    const chooseDestination = jest.fn();

    store.set(focusStackState.atom, [
      {
        focusId: FOCUS_ID,
        componentInstance: {
          componentType: FocusComponentType.DROPDOWN,
          componentInstanceId: FOCUS_ID,
        },
        globalHotkeysConfig: {
          enableGlobalHotkeysWithModifiers: true,
          enableGlobalHotkeysConflictingWithKeyboard: true,
        },
      },
    ]);

    render(
      <I18nProvider i18n={i18n}>
        <Provider store={store}>
          <SelectableList
            selectableListInstanceId={FOCUS_ID}
            focusId={FOCUS_ID}
            selectableItemIdArray={['unavailable-destination', 'destination']}
          >
            <NavigationMenuItemSelectableItem
              item={{
                id: 'unavailable-destination',
                label: 'Unavailable destination',
                isDisabled: true,
                onClick: chooseUnavailableDestination,
              }}
            />
            <NavigationMenuItemSelectableItem
              item={{
                id: 'destination',
                label: 'Choose destination',
                onClick: chooseDestination,
              }}
            />
          </SelectableList>
        </Provider>
      </I18nProvider>,
    );

    await user.keyboard('{Enter}');
    await user.click(screen.getByText('Unavailable destination'));
    expect(chooseUnavailableDestination).not.toHaveBeenCalled();

    await user.keyboard('{ArrowDown}{Enter}');
    expect(chooseDestination).toHaveBeenCalledTimes(1);
  });
});
