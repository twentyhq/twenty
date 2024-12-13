import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/test';
import { FormLinksFieldInput } from '../FormLinksFieldInput';

const meta: Meta<typeof FormLinksFieldInput> = {
  title: 'UI/Data/Field/Form/Input/FormLinksFieldInput',
  component: FormLinksFieldInput,
  args: {},
  argTypes: {},
};

export default meta;

type Story = StoryObj<typeof FormLinksFieldInput>;

export const Default: Story = {
  args: {
    label: 'Domaine Name',
    defaultValue: {
      primaryLinkLabel: 'Google',
      primaryLinkUrl: 'www.google.com',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Domaine Name');
    await canvas.findByText('Primary Link Label');
    await canvas.findByText('Google');
  },
};
