import { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { FormAddressFieldInput } from '../FormAddressFieldInput';

const meta: Meta<typeof FormAddressFieldInput> = {
  title: 'UI/Data/Field/Form/Input/FormAddressFieldInput',
  component: FormAddressFieldInput,
  args: {},
  argTypes: {},
};

export default meta;

type Story = StoryObj<typeof FormAddressFieldInput>;

export const Default: Story = {
  args: {
    label: 'Address',
    defaultValue: {
      addressStreet1: '123 Main St',
      addressStreet2: 'Apt 123',
      addressCity: 'Springfield',
      addressState: 'IL',
      addressCountry: 'United States',
      addressPostcode: '12345',
      addressLat: 39.781721,
      addressLng: -89.650148,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('123 Main St');
    await canvas.findByText('Address');
    await canvas.findByText('Post Code');
  },
};

export const WithVariables: Story = {
  args: {
    label: 'Address',
    defaultValue: {
      addressStreet1: '{{a.street1}}',
      addressStreet2: '{{a.street2}}',
      addressCity: '{{a.city}}',
      addressState: '{{a.state}}',
      addressCountry: '{{a.country}}',
      addressPostcode: '{{a.postcode}}',
      addressLat: 39.781721,
      addressLng: -89.650148,
    },
    VariablePicker: () => <div>VariablePicker</div>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const street1Variable = await canvas.findByText('street1');
    const street2Variable = await canvas.findByText('street2');
    const cityVariable = await canvas.findByText('city');
    const stateVariable = await canvas.findByText('state');
    const countryVariable = await canvas.findByText('country');
    const postcodeVariable = await canvas.findByText('postcode');

    expect(street1Variable).toBeVisible();
    expect(street2Variable).toBeVisible();
    expect(cityVariable).toBeVisible();
    expect(stateVariable).toBeVisible();
    expect(countryVariable).toBeVisible();
    expect(postcodeVariable).toBeVisible();

    const variablePickers = await canvas.findAllByText('VariablePicker');
    expect(variablePickers).toHaveLength(6);
  },
};

export const Disabled: Story = {
  args: {
    label: 'Address',
    readonly: true,
    defaultValue: {
      addressStreet1: '123 Main St',
      addressStreet2: 'Apt 123',
      addressCity: 'Springfield',
      addressState: 'IL',
      addressCountry: 'United States',
      addressPostcode: '12345',
      addressLat: 39.781721,
      addressLng: -89.650148,
    },
    onPersist: fn(),
    VariablePicker: () => <div>VariablePicker</div>,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const street1Input = await canvas.findByText('123 Main St');
    const street2Input = await canvas.findByText('Apt 123');
    const cityInput = await canvas.findByText('Springfield');
    const stateInput = await canvas.findByText('IL');
    const postcodeInput = await canvas.findByText('12345');
    const countrySelect = await canvas.findByText('United States');

    await userEvent.type(street1Input, 'XXX');
    await userEvent.type(street2Input, 'YYY');
    await userEvent.type(cityInput, 'ZZZ');
    await userEvent.type(stateInput, 'ZZ');
    await userEvent.type(postcodeInput, '1234');

    await userEvent.click(countrySelect);

    const searchInputInModal = canvas.queryByPlaceholderText('Search');
    expect(searchInputInModal).not.toBeInTheDocument();

    expect(args.onPersist).not.toHaveBeenCalled();

    const variablePickers = canvas.queryAllByText('VariablePicker');
    expect(variablePickers).toHaveLength(0);
  },
};
