import { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
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

export const WithVariable: Story = {
  args: {
    label: 'Emails',
    defaultValue: {
      primaryEmail: '{{a.b.c}}',
      additionalEmails: [],
    },
    VariablePicker: () => <div>VariablePicker</div>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const primaryEmailVariable = await canvas.findByText('c');
    expect(primaryEmailVariable).toBeVisible();

    const variablePicker = await canvas.findByText('VariablePicker');
    expect(variablePicker).toBeVisible();
  },
};

export const Disabled: Story = {
  args: {
    label: 'Emails',
    defaultValue: {
      primaryEmail: 'tim@twenty.com',
      additionalEmails: [],
    },
    onPersist: fn(),
    VariablePicker: () => <div>VariablePicker</div>,
    readonly: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const editor = canvasElement.querySelector('.ProseMirror > p');
    expect(editor).toBeVisible();

    const defaultValue = await canvas.findByText('tim@twenty.com');
    expect(defaultValue).toBeVisible();

    await userEvent.type(editor, 'hello@gmail.com');

    expect(args.onPersist).not.toHaveBeenCalled();
    expect(canvas.queryByText('hello@gmail.com')).not.toBeInTheDocument();
    expect(defaultValue).toBeVisible();

    const variablePicker = canvas.queryByText('VariablePicker');
    expect(variablePicker).not.toBeInTheDocument();
  },
};
