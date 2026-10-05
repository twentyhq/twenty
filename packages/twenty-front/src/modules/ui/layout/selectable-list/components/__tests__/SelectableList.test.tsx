import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { StrictMode, useState } from 'react';

import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { isSelectedItemIdComponentFamilyState } from '@/ui/layout/selectable-list/states/isSelectedItemIdComponentFamilyState';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';

const FOCUS_ID = 'menu-preselection-test';

const TestItem = ({
  label,
  onEnter,
}: {
  label: string;
  onEnter: () => void;
}) => {
  const isSelectedItemId = useAtomComponentFamilyStateValue(
    isSelectedItemIdComponentFamilyState,
    label,
  );
  return (
    <SelectableListItem itemId={label} onEnter={onEnter}>
      <button aria-pressed={isSelectedItemId}>{label}</button>
    </SelectableListItem>
  );
};

const TestMenu = ({
  onEnter,
  preselect,
}: {
  onEnter: (label: string) => void;
  preselect?: boolean;
}) => {
  const [search, setSearch] = useState('');
  const items = ['Alpha', 'Beta'].filter((label) =>
    label.toLowerCase().includes(search),
  );
  return (
    <SelectableList
      selectableListInstanceId={FOCUS_ID}
      focusId={FOCUS_ID}
      selectableItemIdArray={items}
      shouldPreselectFirstItem={preselect}
    >
      <input
        aria-label="Search"
        autoFocus
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      {items.map((label) => (
        <TestItem key={label} label={label} onEnter={() => onEnter(label)} />
      ))}
    </SelectableList>
  );
};

const renderMenu = (preselect?: boolean) => {
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
  const onEnter = jest.fn();
  const renderResult = render(
    <StrictMode>
      <Provider store={store}>
        <TestMenu onEnter={onEnter} preselect={preselect} />
      </Provider>
    </StrictMode>,
  );
  return { ...renderResult, store, onEnter, user: userEvent.setup() };
};

describe('SelectableList preselection', () => {
  it('selects the first item by default and activates it with Enter', async () => {
    const { user, onEnter } = renderMenu();
    expect(
      screen.getByRole('button', { name: 'Alpha', pressed: true }),
    ).toBeInTheDocument();
    await user.keyboard('{Enter}');
    expect(onEnter).toHaveBeenCalledWith('Alpha');
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onEnter).toHaveBeenLastCalledWith('Beta');
  });

  it('selects the first remaining result and clears selection for empty results', async () => {
    const { user, onEnter } = renderMenu();
    await user.type(screen.getByRole('textbox', { name: 'Search' }), 'be');
    expect(
      screen.getByRole('button', { name: 'Beta', pressed: true }),
    ).toBeInTheDocument();
    await user.keyboard('{Enter}');
    expect(onEnter).toHaveBeenCalledWith('Beta');
    onEnter.mockClear();
    await user.type(screen.getByRole('textbox', { name: 'Search' }), 'xyz');
    await user.keyboard('{Enter}');
    expect(onEnter).not.toHaveBeenCalled();
    await user.clear(screen.getByRole('textbox', { name: 'Search' }));
    await user.keyboard('{Enter}');
    expect(onEnter).toHaveBeenCalledWith('Alpha');
  });

  it('starts at the first item when the menu reopens', async () => {
    const { user, onEnter, store, unmount } = renderMenu();
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onEnter).toHaveBeenLastCalledWith('Beta');
    unmount();
    render(
      <Provider store={store}>
        <TestMenu onEnter={onEnter} />
      </Provider>,
    );
    expect(
      screen.getByRole('button', { name: 'Alpha', pressed: true }),
    ).toBeInTheDocument();
    await user.keyboard('{Enter}');
    expect(onEnter).toHaveBeenLastCalledWith('Alpha');
  });

  it('supports opting out of preselection', async () => {
    const { user, onEnter } = renderMenu(false);
    await user.keyboard('{Enter}');
    expect(onEnter).not.toHaveBeenCalled();
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onEnter).toHaveBeenCalledWith('Alpha');
  });
});
