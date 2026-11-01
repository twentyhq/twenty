import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';

import { MultipleSelectDropdown } from '@/object-record/select/components/MultipleSelectDropdown';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';

const FOCUS_ID = 'multiple-select-keyboard-test';

const ITEMS = [
  { id: 'alpha', name: 'Alpha', isSelected: false },
  { id: 'beta', name: 'Beta', isSelected: false },
];

const renderDropdown = () => {
  const store = createStore();
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
  const onChange = jest.fn();

  render(
    <Provider store={store}>
      <input aria-label="Search" autoFocus />
      <MultipleSelectDropdown
        selectableListId={FOCUS_ID}
        focusId={FOCUS_ID}
        itemsToSelect={ITEMS}
        filteredSelectedItems={[]}
        selectedItems={[]}
        searchFilter=""
        loadingItems={false}
        onChange={onChange}
      />
    </Provider>,
  );

  return { onChange, user: userEvent.setup() };
};

describe('MultipleSelectDropdown keyboard navigation', () => {
  it('activates the next item after pointer selection and arrow navigation', async () => {
    const { user, onChange } = renderDropdown();

    await user.click(screen.getByRole('option', { name: 'Alpha' }));
    onChange.mockClear();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('option', { name: 'Beta' })).toHaveAttribute(
      'data-highlighted',
    );
    expect(screen.getByRole('option', { name: 'Beta' })).toHaveFocus();
    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(
      { ...ITEMS[1], isSelected: true },
      true,
    );
    expect(screen.getByRole('option', { name: 'Beta' })).toHaveFocus();
  });

  it('focuses the highlighted item when arrow navigation reaches a boundary', async () => {
    const { user, onChange } = renderDropdown();

    await user.click(screen.getByRole('option', { name: 'Beta' }));
    onChange.mockClear();
    await user.keyboard('{ArrowUp}{Enter}');

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(
      { ...ITEMS[0], isSelected: true },
      true,
    );
    expect(screen.getByRole('option', { name: 'Alpha' })).toHaveFocus();
  });

  it('keeps search focus while activating the highlighted item with Enter', async () => {
    const { user, onChange } = renderDropdown();

    await user.keyboard('{ArrowDown}{Enter}');

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(
      { ...ITEMS[1], isSelected: true },
      true,
    );
    expect(screen.getByRole('textbox', { name: 'Search' })).toHaveFocus();
  });
});
