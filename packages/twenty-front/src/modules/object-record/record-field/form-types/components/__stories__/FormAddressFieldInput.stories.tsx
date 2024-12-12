import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/test';
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
      addressCountry: 'US',
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
