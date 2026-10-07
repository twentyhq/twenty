import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';

import { CountrySelect } from '@/ui/input/components/internal/country/components/CountrySelect';
import { SELECT_COUNTRY_DROPDOWN_ID } from '@/ui/input/components/internal/country/constants/SelectCountryDropdownId';
import { activeDropdownFocusIdState } from '@/ui/layout/dropdown/states/activeDropdownFocusIdState';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';

const renderCountrySelect = () => {
  const store = createStore();
  const onChange = jest.fn();
  const { unmount } = render(
    <JotaiProvider store={store}>
      <CountrySelect
        label="Country"
        selectedCountryName="France"
        onChange={onChange}
      />
    </JotaiProvider>,
  );

  return { store, onChange, unmount };
};

describe('CountrySelect frontend adapter', () => {
  it('keeps a stored country name selected and clears it to an empty string', async () => {
    const user = userEvent.setup();
    const { store, onChange } = renderCountrySelect();

    await user.click(screen.getByText('France'));

    const popup = await screen.findByRole('dialog', { name: 'Country' });

    expect(
      within(popup).getByRole('button', { name: 'France' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(store.get(activeDropdownFocusIdState.atom)).toBe(
      SELECT_COUNTRY_DROPDOWN_ID,
    );

    await user.click(within(popup).getByRole('button', { name: 'No country' }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('');
    expect(store.get(activeDropdownFocusIdState.atom)).toBeNull();
    expect(store.get(focusStackState.atom)).toEqual([]);

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  });

  it('removes its dropdown registration when the address editor unmounts', async () => {
    const user = userEvent.setup();
    const { store, unmount } = renderCountrySelect();
    const dropdownOpenState = isDropdownOpenComponentState.atomFamily({
      instanceId: SELECT_COUNTRY_DROPDOWN_ID,
    });

    await user.click(screen.getByText('France'));

    expect(store.get(dropdownOpenState)).toBe(true);
    expect(store.get(focusStackState.atom)).toEqual([
      expect.objectContaining({ focusId: SELECT_COUNTRY_DROPDOWN_ID }),
    ]);

    unmount();

    await waitFor(() => expect(store.get(dropdownOpenState)).toBe(false));
    expect(store.get(activeDropdownFocusIdState.atom)).toBeNull();
    expect(store.get(focusStackState.atom)).toEqual([]);
  });
});
