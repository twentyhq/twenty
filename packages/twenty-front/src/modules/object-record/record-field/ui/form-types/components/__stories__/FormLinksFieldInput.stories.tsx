import { expect, fn, userEvent, within } from '@storybook/test';
import { type Meta, type StoryObj } from '@storybook/react';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { FormLinksFieldInput } from '@/object-record/record-field/ui/form-types/components/FormLinksFieldInput';

const meta: Meta<typeof FormLinksFieldInput> = {
  title: 'UI/Data/Field/Form/Input/FormLinksFieldInput',
  component: FormLinksFieldInput,
  args: {},
  argTypes: {},
  decorators: [WorkflowStepDecorator, I18nFrontDecorator],
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
      primaryLinkLabel: '{{04d5f3bf-9714-400d-ba27-644006a5fb1b.name}}',
      primaryLinkUrl: '{{04d5f3bf-9714-400d-ba27-644006a5fb1b.stage}}',
    },
    VariablePicker: () => <div>VariablePicker</div>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const primaryLinkLabelVariable = await canvas.findByText('Name');
    expect(primaryLinkLabelVariable).toBeVisible();

    const primaryLinkUrlVariable = await canvas.findByText('Stage');
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
    label: 'Domain Name',
    readonly: true,
    onChange: fn(),
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

    expect(args.onChange).not.toHaveBeenCalled();

    const variablePickers = canvas.queryAllByText('VariablePicker');
    expect(variablePickers).toHaveLength(0);
  },
};
