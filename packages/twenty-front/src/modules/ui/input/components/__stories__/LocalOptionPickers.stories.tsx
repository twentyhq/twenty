import { ConfigVariableDatabaseInput } from '@/settings/admin-panel/config-variables/components/ConfigVariableDatabaseInput';
import { CurrencyPickerDropdownButton } from '@/ui/input/components/internal/currency/components/CurrencyPickerDropdownButton';
import { PhoneCountryPickerDropdownButton } from '@/ui/input/components/internal/phone/components/PhoneCountryPickerDropdownButton';
import { DropdownMenuInnerSelect } from '@/ui/layout/dropdown/components/DropdownMenuInnerSelect';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ConfigVariableType } from '~/generated-admin/graphql';

const CurrencyExample = () => {
  const [currency, setCurrency] = useState('USD');
  return (
    <CurrencyPickerDropdownButton
      selectedCurrencyCode={currency}
      onChange={(option) => setCurrency(option.value)}
    />
  );
};

const PhoneExample = () => {
  const [country, setCountry] = useState('US');
  return (
    <PhoneCountryPickerDropdownButton value={country} onChange={setCountry} />
  );
};

const ArrayExample = ({ disabled = false }: { disabled?: boolean }) => {
  const [values, setValues] = useState<string[]>(['Alpha']);
  return (
    <ConfigVariableDatabaseInput
      label="Allowed values"
      type={ConfigVariableType.ARRAY}
      value={values}
      options={['Alpha', 'Beta', 'Gamma']}
      onChange={(value) => setValues(value as string[])}
      disabled={disabled}
    />
  );
};

const InnerSelectExample = () => {
  const options = [
    { value: 'first', label: 'First' },
    { value: 'disabled', label: 'Disabled', disabled: true },
    { value: 'last', label: 'Last' },
  ];
  const [option, setOption] = useState(options[0]);
  return (
    <DropdownMenuInnerSelect
      dropdownId="inner-select-story"
      selectedOption={option}
      options={options}
      onChange={setOption}
    />
  );
};

const meta: Meta = {
  title: 'UI/Input/LocalOptionPickers',
  decorators: [ComponentDecorator],
};
export default meta;
type Story = StoryObj;

export const CurrencySearchAndKeyboard: Story = {
  render: () => <CurrencyExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button');
    await userEvent.click(trigger);
    const search = await body.findByRole('searchbox', { name: 'Search' });
    await userEvent.type(search, 'zzzzzz');
    expect(await body.findByText('No results')).toBeVisible();
    await userEvent.clear(search);
    await userEvent.type(search, 'euro');
    const euro = await body.findByRole('button', { name: /Euro \(EUR\)/ });
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    await expect(euro).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveTextContent('EUR');
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.click(trigger);
    expect(await body.findByRole('searchbox', { name: 'Search' })).toHaveValue(
      '',
    );
    await userEvent.keyboard('{Escape}');
  },
};

export const PhoneSearchAndSelection: Story = {
  render: () => <PhoneExample />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = within(canvasElement).getByRole('button');
    await userEvent.click(trigger);
    await userEvent.type(
      await body.findByRole('searchbox', { name: 'Search' }),
      'france',
    );
    await userEvent.click(
      await body.findByRole('button', { name: /France \(\+33\)/ }),
    );
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await userEvent.click(trigger);
    expect(
      await body.findByRole('button', { name: /France \(\+33\)/ }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(body.getByRole('searchbox', { name: 'Search' })).toHaveValue('');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const MultipleOptionsStayOpen: Story = {
  render: () => <ArrayExample />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(within(canvasElement).getByRole('button'));
    const beta = await body.findByRole('button', { name: 'Beta' });
    await userEvent.click(beta);
    expect(beta).toHaveAttribute('aria-pressed', 'true');
    expect(body.getByRole('dialog')).toBeVisible();
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(body.getByRole('button', { name: 'Gamma' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await userEvent.click(body.getByRole('button', { name: 'Alpha' }));
    expect(within(canvasElement).getByRole('button')).toHaveTextContent(
      'Beta, Gamma',
    );
    await userEvent.keyboard('{Escape}');
  },
};

export const DisabledMultiplePicker: Story = {
  render: () => <ArrayExample disabled />,
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button');
    expect(trigger).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(trigger);
    expect(
      within(canvasElement.ownerDocument.body).queryByRole('dialog'),
    ).not.toBeInTheDocument();
  },
};

export const InnerSelectSkipsDisabled: Story = {
  render: () => <InnerSelectExample />,
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button');
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(trigger);
    expect(
      await body.findByRole('button', { name: 'Disabled' }),
    ).toHaveAttribute('aria-disabled', 'true');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveTextContent('Last');
  },
};
