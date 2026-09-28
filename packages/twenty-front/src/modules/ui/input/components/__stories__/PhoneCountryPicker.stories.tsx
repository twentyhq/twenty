import { type Meta, type StoryObj } from '@storybook/react-vite';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { type E164Number } from 'libphonenumber-js';
import { useState } from 'react';
import ReactPhoneNumberInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Button } from 'twenty-ui/primitives/input';
import { ComponentDecorator } from 'twenty-ui/testing';

import { PhoneCountryPickerDropdownButton } from '@/ui/input/components/internal/phone/components/PhoneCountryPickerDropdownButton';

const onCountryChange = fn();

const LibraryPhoneInput = ({
  label = 'Phone',
  disabled = false,
  readOnly = false,
}: {
  label?: string;
  disabled?: boolean;
  readOnly?: boolean;
}) => {
  const [value, setValue] = useState<E164Number>();

  return (
    <ReactPhoneNumberInput
      aria-label={label}
      value={value}
      onChange={setValue}
      onCountryChange={onCountryChange}
      international
      withCountryCallingCode
      defaultCountry="US"
      disabled={disabled}
      readOnly={readOnly}
      countrySelectComponent={PhoneCountryPickerDropdownButton}
    />
  );
};

const ControlledCountryPicker = () => {
  const [value, setValue] = useState<string | undefined>('US');

  return (
    <>
      <PhoneCountryPickerDropdownButton value={value} onChange={setValue} />
      <Button onClick={() => setValue(undefined)}>Clear country</Button>
    </>
  );
};

const meta: Meta = {
  title: 'UI/Input/PhoneCountryPicker',
  decorators: [ComponentDecorator],
  beforeEach: () => {
    onCountryChange.mockClear();
  },
};

export default meta;
type Story = StoryObj;

export const PhoneLibrarySelectionAndFocus: Story = {
  render: () => <LibraryPhoneInput />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Country' });
    const phoneInput = canvas.getByRole('textbox', { name: 'Phone' });

    await userEvent.tab();
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAccessibleDescription('United States');
    await userEvent.keyboard('{Enter}');

    const popup = await body.findByRole('dialog', { name: 'Country' });
    const search = within(popup).getByRole('searchbox', { name: 'Search' });
    await waitFor(() => expect(search).toHaveFocus());
    expect(within(popup).getAllByRole('button')[0]).toHaveAccessibleName(
      'United States (+1)',
    );
    await userEvent.type(search, 'france');
    const france = await within(popup).findByRole('button', {
      name: 'France (+33)',
    });
    expect(within(popup).queryByRole('button', { pressed: true })).toBeNull();
    await waitFor(() => expect(france).toHaveAttribute('data-highlighted'));
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    expect(onCountryChange).toHaveBeenLastCalledWith('FR');
    await waitFor(() => expect(phoneInput).toHaveFocus());
    expect(trigger).toHaveAccessibleDescription('France');

    await userEvent.click(trigger);
    const reopenedPopup = await body.findByRole('dialog', { name: 'Country' });
    const reopenedSearch = within(reopenedPopup).getByRole('searchbox', {
      name: 'Search',
    });
    expect(reopenedSearch).toHaveValue('');
    expect(
      within(reopenedPopup).getByRole('button', { name: 'France (+33)' }),
    ).toHaveAttribute('aria-pressed', 'true');
    await userEvent.type(reopenedSearch, 'germany');
    await userEvent.click(
      await within(reopenedPopup).findByRole('button', {
        name: 'Germany (+49)',
      }),
    );
    await waitFor(() => expect(reopenedPopup).not.toBeInTheDocument());
    expect(onCountryChange).toHaveBeenLastCalledWith('DE');
    await waitFor(() => expect(phoneInput).toHaveFocus());

    await userEvent.click(trigger);
    await body.findByRole('dialog', { name: 'Country' });
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const IndependentPhoneInputs: Story = {
  render: () => (
    <>
      <LibraryPhoneInput label="Work phone" />
      <LibraryPhoneInput label="Personal phone" />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const [workTrigger, personalTrigger] = canvas.getAllByRole('button', {
      name: 'Country',
    });
    assertIsDefinedOrThrow(workTrigger);
    assertIsDefinedOrThrow(personalTrigger);

    await userEvent.click(workTrigger);
    const workPopup = await body.findByRole('dialog', { name: 'Country' });
    expect(body.getAllByRole('dialog')).toHaveLength(1);
    expect(personalTrigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.type(
      within(workPopup).getByRole('searchbox', { name: 'Search' }),
      'france',
    );
    await userEvent.click(
      await within(workPopup).findByRole('button', { name: 'France (+33)' }),
    );
    await waitFor(() => expect(workPopup).not.toBeInTheDocument());
    await waitFor(() =>
      expect(canvas.getByRole('textbox', { name: 'Work phone' })).toHaveFocus(),
    );
    expect(workTrigger).toHaveAccessibleDescription('France');
    expect(personalTrigger).toHaveAccessibleDescription('United States');

    await userEvent.click(personalTrigger);
    const personalPopup = await body.findByRole('dialog', { name: 'Country' });
    expect(body.getAllByRole('dialog')).toHaveLength(1);
    expect(workTrigger).toHaveAttribute('aria-expanded', 'false');
    expect(
      within(personalPopup).getByRole('searchbox', { name: 'Search' }),
    ).toHaveValue('');
    expect(
      within(personalPopup).getByRole('button', {
        name: 'United States (+1)',
      }),
    ).toHaveAttribute('aria-pressed', 'true');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(personalTrigger).toHaveFocus());
  },
};

export const DisabledAndReadOnlyPhoneInputs: Story = {
  render: () => (
    <>
      <LibraryPhoneInput label="Disabled phone" disabled />
      <LibraryPhoneInput label="Read-only phone" readOnly />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const [disabledTrigger, readOnlyTrigger] = canvas.getAllByRole('button', {
      name: 'Country',
    });
    assertIsDefinedOrThrow(disabledTrigger);
    assertIsDefinedOrThrow(readOnlyTrigger);

    expect(disabledTrigger).toBeDisabled();
    expect(readOnlyTrigger).toBeDisabled();
    expect(
      canvas.getByRole('textbox', { name: 'Disabled phone' }),
    ).toBeDisabled();
    expect(
      canvas.getByRole('textbox', { name: 'Read-only phone' }),
    ).toHaveAttribute('readonly');
    await userEvent.click(disabledTrigger);
    await userEvent.click(readOnlyTrigger);
    expect(body.queryByRole('dialog')).toBeNull();
  },
};

export const ClearedCountryRemovesSelection: Story = {
  render: () => <ControlledCountryPicker />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Country' });

    expect(trigger).toHaveAccessibleDescription('United States');
    await userEvent.click(trigger);
    const popup = await body.findByRole('dialog', { name: 'Country' });
    expect(
      within(popup).getByRole('button', { name: 'United States (+1)' }),
    ).toHaveAttribute('aria-pressed', 'true');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    await userEvent.click(
      canvas.getByRole('button', { name: 'Clear country' }),
    );
    expect(trigger).not.toHaveAccessibleDescription();
    await userEvent.click(trigger);
    const clearedPopup = await body.findByRole('dialog', { name: 'Country' });
    expect(
      within(clearedPopup).queryByRole('button', { pressed: true }),
    ).toBeNull();
    await userEvent.type(
      within(clearedPopup).getByRole('searchbox', { name: 'Search' }),
      'france',
    );
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(clearedPopup).not.toBeInTheDocument());
    expect(trigger).toHaveAccessibleDescription('France');
    await userEvent.click(trigger);
    expect(
      await body.findByRole('button', { name: 'France (+33)', pressed: true }),
    ).toBeVisible();
    await userEvent.keyboard('{Escape}');
  },
};
