import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { CountrySelect } from '@/ui/input/components/internal/country/components/CountrySelect';
import { SELECT_COUNTRY_DROPDOWN_ID } from '@/ui/input/components/internal/country/constants/SelectCountryDropdownId';
import { activeDropdownFocusIdState } from '@/ui/layout/dropdown/states/activeDropdownFocusIdState';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

import { CountrySelectExample } from './CountrySelectExample';

const onCountryChange = fn<(countryName: string) => void>();

const meta: Meta<typeof CountrySelect> = {
  title: 'UI/Input/CountrySelect',
  component: CountrySelect,
  decorators: [ComponentDecorator],
  args: {
    label: 'Country',
    selectedCountryName: 'France',
    onChange: onCountryChange,
  },
  beforeEach: () => {
    onCountryChange.mockClear();
  },
  render: ({ label, selectedCountryName, onChange }) => (
    <CountrySelectExample
      label={label}
      selectedCountryName={selectedCountryName}
      onChange={onChange}
    />
  ),
};

export default meta;

type Story = StoryObj<typeof CountrySelect>;

export const ClearAndReselectPreservesCountryNames: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Country' });

    await userEvent.click(trigger);
    const popup = await body.findByRole('dialog', { name: 'Country' });

    expect(
      within(popup).getByRole('option', { name: 'France' }),
    ).toHaveAttribute('aria-selected', 'true');
    expect(jotaiStore.get(activeDropdownFocusIdState.atom)).toBe(
      SELECT_COUNTRY_DROPDOWN_ID,
    );

    await userEvent.click(
      within(popup).getByRole('option', { name: 'No country' }),
    );

    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(onCountryChange).toHaveBeenCalledTimes(1);
    expect(onCountryChange).toHaveBeenCalledWith('');
    expect(
      canvas.getByRole('status', { name: 'Stored country' }),
    ).toHaveTextContent('empty');
    expect(jotaiStore.get(activeDropdownFocusIdState.atom)).toBeNull();
    expect(jotaiStore.get(focusStackState.atom)).toEqual([]);

    await userEvent.click(trigger);
    await userEvent.type(
      await body.findByRole('searchbox', { name: 'Search' }),
      'Brazil',
    );
    await userEvent.click(await body.findByRole('option', { name: 'Brazil' }));

    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(onCountryChange).toHaveBeenNthCalledWith(2, 'Brazil');
    expect(onCountryChange).toHaveBeenCalledTimes(2);
    expect(trigger).toHaveTextContent('Brazil');
    expect(
      canvas.getByRole('status', { name: 'Stored country' }),
    ).toHaveTextContent('Brazil');
  },
};

export const ExternalValuesPreserveLegacyCountries: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Country' });

    await userEvent.click(canvas.getByRole('button', { name: 'Set Brazil' }));
    expect(trigger).toHaveTextContent('Brazil');
    expect(onCountryChange).not.toHaveBeenCalled();

    await userEvent.click(trigger);
    const brazilPopup = await body.findByRole('dialog', { name: 'Country' });

    expect(
      within(brazilPopup).getByRole('option', { name: 'Brazil' }),
    ).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );

    await userEvent.click(
      canvas.getByRole('button', { name: 'Set legacy country' }),
    );
    expect(trigger).toHaveTextContent('No country');
    expect(
      canvas.getByRole('status', { name: 'Stored country' }),
    ).toHaveTextContent('FR');

    await userEvent.click(trigger);
    const popup = await body.findByRole('dialog', { name: 'Country' });

    expect(
      within(popup).queryByRole('option', { selected: true }),
    ).not.toBeInTheDocument();
    expect(onCountryChange).not.toHaveBeenCalled();
    await userEvent.click(
      within(popup).getByRole('option', { name: 'No country' }),
    );

    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(onCountryChange).toHaveBeenCalledTimes(1);
    expect(onCountryChange).toHaveBeenCalledWith('');

    await userEvent.click(
      canvas.getByRole('button', { name: 'Set empty country' }),
    );
    await userEvent.click(trigger);
    const emptyPopup = await body.findByRole('dialog', { name: 'Country' });

    expect(
      within(emptyPopup).getByRole('option', { name: 'No country' }),
    ).toHaveAttribute('aria-selected', 'true');
    expect(onCountryChange).toHaveBeenCalledTimes(1);
    await userEvent.keyboard('{Escape}');
  },
};

export const UnmountCleansDropdownRegistration: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const dropdownOpenState = isDropdownOpenComponentState.atomFamily({
      instanceId: SELECT_COUNTRY_DROPDOWN_ID,
    });

    await userEvent.click(canvas.getByRole('button', { name: 'Country' }));
    await body.findByRole('dialog', { name: 'Country' });

    expect(jotaiStore.get(dropdownOpenState)).toBe(true);
    expect(jotaiStore.get(focusStackState.atom)).toEqual([
      expect.objectContaining({ focusId: SELECT_COUNTRY_DROPDOWN_ID }),
    ]);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Unmount country picker' }),
    );

    await waitFor(() => expect(jotaiStore.get(dropdownOpenState)).toBe(false));
    expect(jotaiStore.get(activeDropdownFocusIdState.atom)).toBeNull();
    expect(jotaiStore.get(focusStackState.atom)).toEqual([]);
    expect(body.queryByRole('dialog')).not.toBeInTheDocument();
  },
};
