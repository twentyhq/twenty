import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/test';
import { FormEmailsFieldInput } from '../FormEmailsFieldInput';

const meta: Meta<typeof FormEmailsFieldInput> = {
  title: 'UI/Data/Field/Form/Input/FormEmailsFieldInput',
  component: FormEmailsFieldInput,
  args: {},
  argTypes: {},
};

export default meta;

type Story = StoryObj<typeof FormEmailsFieldInput>;

export const Default: Story = {
  args: {
    label: 'Emails',
    defaultValue: {
      primaryEmail: 'tim@twenty.com',
      additionalEmails: [],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Emails');
    await canvas.findByText('Primary Email');
    await canvas.findByText('tim@twenty.com');
  },
};
