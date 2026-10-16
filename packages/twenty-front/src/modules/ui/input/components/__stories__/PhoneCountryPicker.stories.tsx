import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type E164Number } from 'libphonenumber-js';
import { useState } from 'react';
import ReactPhoneNumberInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Button } from 'twenty-ui/primitives/input';
import { ComponentDecorator } from 'twenty-ui/testing';

import { PhoneCountryPickerDropdownButton } from '@/ui/input/components/internal/phone/components/PhoneCountryPickerDropdownButton';

const onCountryChange = fn();
const onPhoneValueChange = fn();
const onControlledCountryChange = fn();

const FRENCH_PHONE_NUMBER = '+33642646274' as E164Number;
const BRITISH_PHONE_NUMBER = '+442079460018' as E164Number;
const AMERICAN_PHONE_NUMBER = '+16502530000' as E164Number;

const LibraryPhoneInput = ({
  label = 'Phone',
  disabled = false,
  readOnly = false,
  initialValue,
  showExternalControls = false,
}: {
  label?: string;
  disabled?: boolean;
  readOnly?: boolean;
  initialValue?: E164Number;
  showExternalControls?: boolean;
}) => {
  const [value, setValue] = useState<E164Number | undefined>(initialValue);

  const handleChange = (phoneValue: E164Number | undefined) => {
    setValue(phoneValue);
    onPhoneValueChange(phoneValue);
  };

  return (
    <>
      <ReactPhoneNumberInput
        aria-label={label}
        value={value}
        onChange={handleChange}
        onCountryChange={onCountryChange}
        international
        withCountryCallingCode
        defaultCountry="US"
        disabled={disabled}
        readOnly={readOnly}
        countrySelectComponent={PhoneCountryPickerDropdownButton}
      />
      {showExternalControls && (
        <>
          <Button onClick={() => setValue(BRITISH_PHONE_NUMBER)}>
            Replace phone
          </Button>
          <Button onClick={() => setValue(undefined)}>Clear phone</Button>
        </>
      )}
    </>
  );
};

const ControlledCountryPicker = () => {
  const [value, setValue] = useState<string | undefined>('US');

  return (
    <>
      <PhoneCountryPickerDropdownButton
        value={value}
        onChange={(countryCode) => {
          setValue(countryCode);
          onControlledCountryChange(countryCode);
        }}
      />
      <Button onClick={() => setValue(undefined)}>Clear country</Button>
      <Button onClick={() => setValue('GB')}>Replace country</Button>
    </>
  );
};

const meta: Meta = {
  title: 'UI/Input/PhoneCountryPicker',
  decorators: [ComponentDecorator],
  beforeEach: () => {
    onCountryChange.mockClear();
    onPhoneValueChange.mockClear();
    onControlledCountryChange.mockClear();
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
    expect(within(popup).getAllByRole('option')[0]).toHaveAccessibleName(
      'United States (+1)',
    );
    await userEvent.type(search, 'france');
    const france = await within(popup).findByRole('option', {
      name: 'France (+33)',
    });
    expect(within(popup).queryByRole('option', { selected: true })).toBeNull();
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
      within(reopenedPopup).getByRole('option', { name: 'France (+33)' }),
    ).toHaveAttribute('aria-selected', 'true');
    await userEvent.type(reopenedSearch, 'germany');
    await userEvent.click(
      await within(reopenedPopup).findByRole('option', {
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

    await userEvent.click(workTrigger);
    const workPopup = await body.findByRole('dialog', { name: 'Country' });
    expect(body.getAllByRole('dialog')).toHaveLength(1);
    expect(personalTrigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.type(
      within(workPopup).getByRole('searchbox', { name: 'Search' }),
      'france',
    );
    await userEvent.click(
      await within(workPopup).findByRole('option', { name: 'France (+33)' }),
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
      within(personalPopup).getByRole('option', {
        name: 'United States (+1)',
      }),
    ).toHaveAttribute('aria-selected', 'true');
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
      within(popup).getByRole('option', { name: 'United States (+1)' }),
    ).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    await userEvent.click(
      canvas.getByRole('button', { name: 'Clear country' }),
    );
    expect(trigger).not.toHaveAccessibleDescription();
    expect(onControlledCountryChange).not.toHaveBeenCalled();
    await userEvent.click(trigger);
    const clearedPopup = await body.findByRole('dialog', { name: 'Country' });
    expect(
      within(clearedPopup).queryByRole('option', { selected: true }),
    ).toBeNull();
    await userEvent.type(
      within(clearedPopup).getByRole('searchbox', { name: 'Search' }),
      'france',
    );
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(clearedPopup).not.toBeInTheDocument());
    expect(trigger).toHaveAccessibleDescription('France');
    expect(onControlledCountryChange).toHaveBeenLastCalledWith('FR');
    await userEvent.click(trigger);
    expect(
      await body.findByRole('option', { name: 'France (+33)', selected: true }),
    ).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull());
    await userEvent.click(
      canvas.getByRole('button', { name: 'Replace country' }),
    );
    expect(trigger).toHaveAccessibleDescription('United Kingdom');
    expect(onControlledCountryChange).toHaveBeenCalledTimes(1);
    await userEvent.click(trigger);
    const replacedPopup = await body.findByRole('dialog', { name: 'Country' });
    expect(
      within(replacedPopup).getByRole('option', {
        name: 'United Kingdom (+44)',
      }),
    ).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{Escape}');
  },
};

export const CountryChangesPreservePhoneLibraryBehavior: Story = {
  render: () => <LibraryPhoneInput initialValue={FRENCH_PHONE_NUMBER} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Country' });
    const phoneInput = canvas.getByRole('textbox', { name: 'Phone' });

    expect(trigger).toHaveAccessibleDescription('France');
    expect(phoneInput).toHaveValue('+33 6 42 64 62 74');
    await userEvent.click(trigger);
    const canceledPopup = await body.findByRole('dialog', { name: 'Country' });
    await userEvent.type(
      within(canceledPopup).getByRole('searchbox', { name: 'Search' }),
      'germany',
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(canceledPopup).not.toBeInTheDocument());
    expect(phoneInput).toHaveValue('+33 6 42 64 62 74');
    expect(onPhoneValueChange).not.toHaveBeenCalled();

    await userEvent.click(trigger);
    const popup = await body.findByRole('dialog', { name: 'Country' });
    await userEvent.type(
      within(popup).getByRole('searchbox', { name: 'Search' }),
      'germany',
    );
    await userEvent.click(
      await within(popup).findByRole('option', { name: 'Germany (+49)' }),
    );
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    expect(onCountryChange).toHaveBeenLastCalledWith('DE');
    expect(onPhoneValueChange).toHaveBeenLastCalledWith('+49');
    expect(trigger).toHaveAccessibleDescription('Germany');
    expect(phoneInput).toHaveValue('+49');
    await waitFor(() => expect(phoneInput).toHaveFocus());
    await userEvent.type(phoneInput, '30123456');
    expect(onPhoneValueChange).toHaveBeenLastCalledWith('+4930123456');
  },
};

export const ExternalPhoneUpdatesControlCountry: Story = {
  render: () => (
    <LibraryPhoneInput
      initialValue={FRENCH_PHONE_NUMBER}
      showExternalControls
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Country' });
    const phoneInput = canvas.getByRole('textbox', { name: 'Phone' });

    expect(trigger).toHaveAccessibleDescription('France');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Replace phone' }),
    );
    expect(trigger).toHaveAccessibleDescription('United Kingdom');
    expect(phoneInput).toHaveValue('+44 20 7946 0018');
    expect(onPhoneValueChange).not.toHaveBeenCalled();
    await userEvent.click(trigger);
    const popup = await body.findByRole('dialog', { name: 'Country' });
    expect(
      within(popup).getByRole('option', { name: 'United Kingdom (+44)' }),
    ).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(popup).not.toBeInTheDocument());

    await userEvent.click(canvas.getByRole('button', { name: 'Clear phone' }));
    expect(onPhoneValueChange).not.toHaveBeenCalled();
    expect(trigger).toHaveAccessibleDescription('United States');
    expect(phoneInput).toHaveValue('+1');
    await userEvent.click(trigger);
    const clearedPopup = await body.findByRole('dialog', { name: 'Country' });
    expect(
      within(clearedPopup).getByRole('option', { name: 'United States (+1)' }),
    ).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{Escape}');
  },
};

export const SharedCallingCodesPreservePhoneDigits: Story = {
  render: () => <LibraryPhoneInput initialValue={AMERICAN_PHONE_NUMBER} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Country' });
    const phoneInput = canvas.getByRole('textbox', { name: 'Phone' });

    expect(trigger).toHaveAccessibleDescription('United States');
    expect(phoneInput).toHaveValue('+1 650 253 0000');
    await userEvent.click(trigger);
    const popup = await body.findByRole('dialog', { name: 'Country' });
    await userEvent.type(
      within(popup).getByRole('searchbox', { name: 'Search' }),
      'canada',
    );
    await userEvent.click(
      await within(popup).findByRole('option', { name: 'Canada (+1)' }),
    );
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    expect(onCountryChange).toHaveBeenLastCalledWith('CA');
    expect(onPhoneValueChange).toHaveBeenLastCalledWith(AMERICAN_PHONE_NUMBER);
    expect(trigger).toHaveAccessibleDescription('Canada');
    expect(phoneInput).toHaveValue('+1 650 253 0000');
  },
};
