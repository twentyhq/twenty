import { AutocompleteRoot } from '@/ui/input/components/AutocompleteRoot';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import {
  act,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { StrictMode } from 'react';
import { Autocomplete } from 'twenty-ui/primitives/input';

const OPTIONS = ['Paris', 'London'];
const DROPDOWN_ID = 'autocomplete';

const AutocompleteExample = ({
  enabled = true,
  label = 'City',
}: {
  enabled?: boolean;
  label?: string;
}) => (
  <AutocompleteRoot
    dropdownId={DROPDOWN_ID}
    enabled={enabled}
    items={OPTIONS}
    filter={null}
    autoHighlight="always"
  >
    <Autocomplete.InputGroup>
      <Autocomplete.Input aria-label={label} />
    </Autocomplete.InputGroup>
    <Autocomplete.Popup>
      <Autocomplete.List>
        {(option: string) => (
          <Autocomplete.Item key={option} value={option}>
            {option}
          </Autocomplete.Item>
        )}
      </Autocomplete.List>
    </Autocomplete.Popup>
  </AutocompleteRoot>
);

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
    expect(store.get(focusStackState.atom)).toEqual([]);
  });

  it('allows consumers to wait for results before opening without pushing focus', async () => {
    const user = userEvent.setup();
    const store = createStore();
    render(
      <JotaiProvider store={store}>
        <AutocompleteRoot
          dropdownId={DROPDOWN_ID}
          items={OPTIONS}
          onOpenChange={(open, details) => {
            if (open && details.reason === 'input-change') {
              details.cancel();
            }
          }}
        >
          <Autocomplete.Input aria-label="City" />
          <Autocomplete.Popup>
            <Autocomplete.List>
              {(option: string) => (
                <Autocomplete.Item key={option} value={option}>
                  {option}
                </Autocomplete.Item>
              )}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </AutocompleteRoot>
      </JotaiProvider>,
    );

    await user.type(screen.getByRole('combobox'), 'Pa');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(store.get(focusStackState.atom)).toEqual([]);
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

    expect(
      store.get(
        isDropdownOpenComponentState.atomFamily({ instanceId: DROPDOWN_ID }),
      ),
    ).toBe(false);
    expect(store.get(focusStackState.atom)).toEqual([]);
  });
});
