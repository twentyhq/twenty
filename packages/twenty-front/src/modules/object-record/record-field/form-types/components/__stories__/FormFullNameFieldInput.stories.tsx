import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/test';
import { FormFullNameFieldInput } from '../FormFullNameFieldInput';

const meta: Meta<typeof FormFullNameFieldInput> = {
  title: 'UI/Data/Field/Form/Input/FormFullNameFieldInput',
  component: FormFullNameFieldInput,
  args: {},
  argTypes: {},
};

export default meta;

type Story = StoryObj<typeof FormFullNameFieldInput>;

export const Default: Story = {
  args: {
    label: 'Name',
    defaultValue: {
      firstName: 'John',
      lastName: 'Doe',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Name');
    await canvas.findByText('First Name');
    await canvas.findByText('Last Name');
  },
};
