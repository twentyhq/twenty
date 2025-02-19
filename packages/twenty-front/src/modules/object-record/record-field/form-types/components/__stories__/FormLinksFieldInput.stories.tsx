import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, within } from '@storybook/test';
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
    label: 'Domain Name',
    defaultValue: {
      primaryLinkLabel: 'Google',
      primaryLinkUrl: 'https://www.google.com',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Domain Name');
    await canvas.findByText('Primary Link Label');
    await canvas.findByText('Google');
  },
};

export const WithVariables: Story = {
  args: {
    label: 'Domain Name',
    defaultValue: {
      primaryLinkLabel: '{{a.label}}',
      primaryLinkUrl: '{{a.url}}',
    },
    VariablePicker: () => <div>VariablePicker</div>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const primaryLinkLabelVariable = await canvas.findByText('label');
    expect(primaryLinkLabelVariable).toBeVisible();

    const primaryLinkUrlVariable = await canvas.findByText('url');
    expect(primaryLinkUrlVariable).toBeVisible();

    const variablePickers = await canvas.findAllByText('VariablePicker');
    expect(variablePickers).toHaveLength(2);

    for (const variablePicker of variablePickers) {
      expect(variablePicker).toBeVisible();
    }
  },
};

export const Disabled: Story = {
  args: {
    label: 'Number field...',
    readonly: true,
    onPersist: fn(),
    VariablePicker: () => <div>VariablePicker</div>,
    defaultValue: {
      primaryLinkLabel: 'Google',
      primaryLinkUrl: 'https://www.google.com',
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const labelInput = await canvas.findByText('Google');
    const linkInput = await canvas.findByText('https://www.google.com');

    await userEvent.type(labelInput, 'Yahoo');
    await userEvent.type(linkInput, 'https://www.yahoo.com');

    expect(args.onPersist).not.toHaveBeenCalled();

    const variablePickers = canvas.queryAllByText('VariablePicker');
    expect(variablePickers).toHaveLength(0);
  },
};
