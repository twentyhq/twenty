import { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { MOCKED_STEP_ID } from '~/testing/mock-data/workflow';
import { FormAddressFieldInput } from '../FormAddressFieldInput';

const meta: Meta<typeof FormAddressFieldInput> = {
  title: 'UI/Data/Field/Form/Input/FormAddressFieldInput',
  component: FormAddressFieldInput,
  args: {},
  argTypes: {},
  decorators: [WorkflowStepDecorator, I18nFrontDecorator],
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
      addressStreet1: `{{${MOCKED_STEP_ID}.address.street1}}`,
      addressStreet2: `{{${MOCKED_STEP_ID}.address.street2}}`,
      addressCity: `{{${MOCKED_STEP_ID}.address.city}}`,
      addressState: `{{${MOCKED_STEP_ID}.address.state}}`,
      addressCountry: `{{${MOCKED_STEP_ID}.address.country}}`,
      addressPostcode: `{{${MOCKED_STEP_ID}.address.postcode}}`,
      addressLat: 39.781721,
      addressLng: -89.650148,
    },
    VariablePicker: () => <div>VariablePicker</div>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const street1Variable = await canvas.findByText('Street 1');
    const street2Variable = await canvas.findByText('Street 2');
    const cityVariable = await canvas.findByText('My City');
    const stateVariable = await canvas.findByText('My State');
    const postcodeVariable = await canvas.findByText('My Postcode');

    expect(street1Variable).toBeVisible();
    expect(street2Variable).toBeVisible();
    expect(cityVariable).toBeVisible();
    expect(stateVariable).toBeVisible();
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
    onChange: fn(),
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

    expect(args.onChange).not.toHaveBeenCalled();

    const variablePickers = canvas.queryAllByText('VariablePicker');
    expect(variablePickers).toHaveLength(0);
  },
};
