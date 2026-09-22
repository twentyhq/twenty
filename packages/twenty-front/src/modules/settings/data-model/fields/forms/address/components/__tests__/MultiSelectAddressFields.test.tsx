import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'jotai';
import { type ReactNode, useState } from 'react';

import { MultiSelectAddressFields } from '@/settings/data-model/fields/forms/address/components/MultiSelectAddressFields';

const ADDRESS_FIELD_OPTIONS = [
  { label: 'Street', value: 'street' },
  { label: 'City', value: 'city' },
  { label: 'Country', value: 'country' },
];

const Wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>
    <Provider>{children}</Provider>
  </I18nProvider>
);

const AddressFieldsPicker = () => {
  const [values, setValues] = useState(['street']);

  return (
    <MultiSelectAddressFields
      options={ADDRESS_FIELD_OPTIONS}
      values={values}
      onChange={setValues}
      callToActionButton={{
        text: 'Reset to default',
        onClick: () => setValues(['street', 'city', 'country']),
      }}
    />
  );
};

describe('MultiSelectAddressFields', () => {
  it('keeps multiple selections open and closes after resetting to default', async () => {
    const user = userEvent.setup();
    render(<AddressFieldsPicker />, { wrapper: Wrapper });

    const trigger = screen.getByRole('button', {
      name: 'Select address fields',
    });
    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: 'City' }));

    expect(screen.getByRole('button', { name: 'City' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Street' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await user.click(screen.getByRole('button', { name: 'Reset to default' }));

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: 'City' }),
      ).not.toBeInTheDocument();
    });
    expect(trigger).toHaveTextContent('Default');

    await user.click(trigger);
    expect(
      screen.getByRole('button', { name: 'Reset to default' }),
    ).toHaveAttribute('aria-disabled', 'true');
  });

  it('filters results, selects with the keyboard, and clears search after closing', async () => {
    const user = userEvent.setup();
    render(<AddressFieldsPicker />, { wrapper: Wrapper });

    const trigger = screen.getByRole('button', {
      name: 'Select address fields',
    });
    await user.click(trigger);
    await user.type(
      screen.getByRole('searchbox', { name: 'Search address fields' }),
      'City',
    );

    expect(
      screen.queryByRole('button', { name: 'Street' }),
    ).not.toBeInTheDocument();
    await user.keyboard('{ArrowDown}{Enter}');
    expect(screen.getByRole('button', { name: 'City' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await user.keyboard('{Escape}');

    await waitFor(() => expect(trigger).toHaveFocus());
    await user.click(trigger);
    expect(
      screen.getByRole('searchbox', { name: 'Search address fields' }),
    ).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Street' })).toBeInTheDocument();
  });
});
