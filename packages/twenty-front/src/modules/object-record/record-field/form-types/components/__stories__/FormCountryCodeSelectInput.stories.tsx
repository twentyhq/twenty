import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/test';

import { FormCountryCodeSelectInput } from '../FormCountryCodeSelectInput';

const meta: Meta<typeof FormCountryCodeSelectInput> = {
  title: 'UI/Data/Field/Form/Input/FormCountryCodeSelectInput',
  component: FormCountryCodeSelectInput,
  args: {},
  argTypes: {},
};

export default meta;

type Story = StoryObj<typeof FormCountryCodeSelectInput>;

export const Default: Story = {
  args: {
    selectedCountryCode: 'FR',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Country Code');
  },
};
