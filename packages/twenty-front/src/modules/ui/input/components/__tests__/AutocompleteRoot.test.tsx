import { AutocompleteContent } from '@/ui/input/components/AutocompleteContent';
import { AutocompleteRoot } from '@/ui/input/components/AutocompleteRoot';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { ParentClickOutsideIdContext } from '@/ui/utilities/pointer-event/contexts/ParentClickOutsideIdContext';
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { StrictMode, useState } from 'react';
import { Autocomplete } from 'twenty-ui/primitives/input';

const OPTIONS = ['Paris', 'London'];
const DROPDOWN_ID = 'autocomplete';

type AutocompleteExampleProps = {
  enabled?: boolean;
  label?: string;
  items?: string[];
  openOnValueChange?: boolean;
  onItemHighlightedByUser?: (item: string | undefined) => void;
};

const AutocompleteExample = ({
  enabled = true,
  label = 'City',
  items = OPTIONS,
  openOnValueChange,
  onItemHighlightedByUser,
}: AutocompleteExampleProps) => {
  const [value, setValue] = useState('');

  return (
    <AutocompleteRoot
      dropdownId={DROPDOWN_ID}
      enabled={enabled}
      items={items}
      value={value}
      openOnValueChange={openOnValueChange}
      onValueChange={setValue}
      onItemHighlightedByUser={onItemHighlightedByUser}
    >
      <Autocomplete.InputGroup>
        <Autocomplete.Input aria-label={label} />
      </Autocomplete.InputGroup>
      <AutocompleteContent>
        <Autocomplete.List>
          {items.map((option) => (
            <Autocomplete.Item key={option} value={option}>
              {option}
            </Autocomplete.Item>
          ))}
        </Autocomplete.List>
      </AutocompleteContent>
    </AutocompleteRoot>
  );
};

describe('AutocompleteRoot', () => {
  it('keeps input focus while navigating and restores the focus stack on Escape', async () => {
    const user = userEvent.setup();
    const store = createStore();

    render(
      <JotaiProvider store={store}>
        <AutocompleteExample />
      </JotaiProvider>,
    );

    const input = screen.getByRole('combobox', { name: 'City' });
    await user.type(input, 'Pa');

    expect(screen.getAllByRole('option')).toHaveLength(2);
    expect(input).toHaveFocus();
    expect(store.get(focusStackState.atom).at(-1)?.componentInstance).toEqual({
      componentType: FocusComponentType.DROPDOWN,
      componentInstanceId: DROPDOWN_ID,
    });

    await user.keyboard('{ArrowDown}');
    expect(input).toHaveFocus();
    expect(input).toHaveAttribute(
      'aria-activedescendant',
      screen.getByRole('option', { name: 'London' }).id,
    );

    await user.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument(),
    );
    expect(input).toHaveFocus();
    expect(input).toHaveValue('Pa');
    expect(store.get(focusStackState.atom)).toEqual([]);
  });

  it('waits for results before opening when openOnValueChange is false', async () => {
    const user = userEvent.setup();
    const store = createStore();

    render(
      <JotaiProvider store={store}>
        <AutocompleteExample openOnValueChange={false} />
      </JotaiProvider>,
    );

    await user.type(screen.getByRole('combobox'), 'Pa');

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(store.get(focusStackState.atom)).toEqual([]);
  });

  it('opens from the arrow keys once results arrive when openOnValueChange is false', async () => {
    const user = userEvent.setup();
    const store = createStore();

    const { rerender } = render(
      <JotaiProvider store={store}>
        <AutocompleteExample items={[]} openOnValueChange={false} />
      </JotaiProvider>,
    );

    const input = screen.getByRole('combobox');
    await user.type(input, 'Pa');
    await user.keyboard('{ArrowDown}');

    expect(input).toHaveAttribute('aria-expanded', 'false');

    rerender(
      <JotaiProvider store={store}>
        <AutocompleteExample items={OPTIONS} openOnValueChange={false} />
      </JotaiProvider>,
    );
    await user.keyboard('{ArrowDown}');

    expect(screen.getByRole('listbox')).toBeVisible();
    expect(input).toHaveValue('Pa');
    expect(store.get(focusStackState.atom).at(-1)?.componentInstance).toEqual({
      componentType: FocusComponentType.DROPDOWN,
      componentInstanceId: DROPDOWN_ID,
    });
  });

  it('does not open an empty list from the arrow keys', async () => {
    const user = userEvent.setup();
    const store = createStore();

    render(
      <JotaiProvider store={store}>
        <AutocompleteExample items={[]} />
      </JotaiProvider>,
    );

    await user.click(screen.getByRole('combobox'));
    await user.keyboard('{ArrowDown}');

    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(store.get(focusStackState.atom)).toEqual([]);
  });

  it('keeps the highlighted item when the same items are passed again', async () => {
    const user = userEvent.setup();
    const store = createStore();
    const onItemHighlightedByUser = jest.fn();

    const { rerender } = render(
      <JotaiProvider store={store}>
        <AutocompleteExample
          items={[...OPTIONS]}
          onItemHighlightedByUser={onItemHighlightedByUser}
        />
      </JotaiProvider>,
    );

    const input = screen.getByRole('combobox');
    await user.type(input, 'Pa');
    await user.keyboard('{ArrowDown}');

    expect(onItemHighlightedByUser).toHaveBeenLastCalledWith('London');

    onItemHighlightedByUser.mockClear();

    rerender(
      <JotaiProvider store={store}>
        <AutocompleteExample
          items={[...OPTIONS]}
          onItemHighlightedByUser={onItemHighlightedByUser}
        />
      </JotaiProvider>,
    );

    expect(onItemHighlightedByUser).not.toHaveBeenCalled();
    expect(input).toHaveAttribute(
      'aria-activedescendant',
      screen.getByRole('option', { name: 'London' }).id,
    );
  });

  it('opens only the active input for a shared dropdown id and supports external close', async () => {
    const store = createStore();
    const { result } = renderHook(
      () => ({ ...useOpenDropdown(), ...useCloseDropdown() }),
      {
        wrapper: ({ children }) => (
          <JotaiProvider store={store}>{children}</JotaiProvider>
        ),
      },
    );

    render(
      <JotaiProvider store={store}>
        <AutocompleteExample label="Address" />
        <AutocompleteExample label="City" enabled={false} />
      </JotaiProvider>,
    );

    const inactiveInput = screen.getByRole('combobox', { name: 'City' });

    act(() =>
      result.current.openDropdown({
        dropdownComponentInstanceIdFromProps: DROPDOWN_ID,
      }),
    );

    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: 'Address' })).toHaveAttribute(
        'aria-expanded',
        'true',
      ),
    );
    expect(inactiveInput).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getAllByRole('listbox')).toHaveLength(1);

    act(() => result.current.closeDropdown(DROPDOWN_ID));

    await waitFor(() =>
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument(),
    );
    expect(store.get(focusStackState.atom)).toEqual([]);
  });

  it('marks the popup as inside its parent surface and keeps the input focused on press', async () => {
    const user = userEvent.setup();
    const store = createStore();

    render(
      <JotaiProvider store={store}>
        <ParentClickOutsideIdContext.Provider value="side-panel">
          <AutocompleteExample />
        </ParentClickOutsideIdContext.Provider>
      </JotaiProvider>,
    );

    const input = screen.getByRole('combobox');
    await user.type(input, 'Pa');

    const listbox = screen.getByRole('listbox');

    expect(
      listbox.closest('[data-click-outside-id="side-panel"]'),
    ).not.toBeNull();
    expect(fireEvent.mouseDown(listbox)).toBe(false);
  });

  it('cleans up an open autocomplete when its mounted owner leaves StrictMode', async () => {
    const user = userEvent.setup();
    const store = createStore();
    const { unmount } = render(
      <StrictMode>
        <JotaiProvider store={store}>
          <AutocompleteExample />
        </JotaiProvider>
      </StrictMode>,
    );

    await user.type(screen.getByRole('combobox'), 'Pa');
    expect(screen.getByRole('listbox')).toBeVisible();
    unmount();

    await waitFor(() =>
      expect(
        store.get(
          isDropdownOpenComponentState.atomFamily({ instanceId: DROPDOWN_ID }),
        ),
      ).toBe(false),
    );
    expect(store.get(focusStackState.atom)).toEqual([]);
  });
});
