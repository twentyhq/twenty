import { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { getUserDevice } from 'twenty-ui';
import { FormTextFieldInput } from '../FormTextFieldInput';

const meta: Meta<typeof FormTextFieldInput> = {
  title: 'UI/Data/Field/Form/Input/FormTextFieldInput',
  component: FormTextFieldInput,
  args: {},
  argTypes: {},
};

export default meta;

type Story = StoryObj<typeof FormTextFieldInput>;

export const Default: Story = {
  args: {
    placeholder: 'Text field...',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Text',
    placeholder: 'Text field...',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText(/^Text$/);
  },
};

export const Multiline: Story = {
  args: {
    label: 'Text',
    placeholder: 'Text field...',
    multiline: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText(/^Text$/);
  },
};

export const WithVariablePicker: Story = {
  args: {
    label: 'Text',
    placeholder: 'Text field...',
    VariablePicker: () => <div>VariablePicker</div>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const variablePicker = await canvas.findByText('VariablePicker');

    expect(variablePicker).toBeVisible();
  },
};

export const Disabled: Story = {
  args: {
    label: 'Text',
    placeholder: 'Text field...',
    defaultValue: 'Text field',
    readonly: true,
    VariablePicker: () => <div>VariablePicker</div>,
    onPersist: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const variablePicker = canvas.queryByText('VariablePicker');
    expect(variablePicker).not.toBeInTheDocument();

    const editor = canvasElement.querySelector('.ProseMirror > p');
    expect(editor).toBeVisible();

    const defaultValue = await canvas.findByText('Text field');
    expect(defaultValue).toBeVisible();

    await userEvent.type(editor, 'Hello');

    expect(args.onPersist).not.toHaveBeenCalled();
    expect(canvas.queryByText('Hello')).not.toBeInTheDocument();
    expect(defaultValue).toBeVisible();
  },
};

export const HasHistory: Story = {
  args: {
    label: 'Text',
    placeholder: 'Text field...',
    VariablePicker: ({ onVariableSelect }) => {
      return (
        <button
          onClick={() => {
            onVariableSelect('{{test}}');
          }}
        >
          Add variable
        </button>
      );
    },
    onPersist: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const controlKey = getUserDevice() === 'mac' ? 'Meta' : 'Control';

    const canvas = within(canvasElement);

    const editor = canvasElement.querySelector('.ProseMirror > p');
    expect(editor).toBeVisible();

    const addVariableButton = await canvas.findByRole('button', {
      name: 'Add variable',
    });

    await userEvent.type(editor, 'Hello World ');

    await userEvent.click(addVariableButton);

    expect(args.onPersist).toHaveBeenLastCalledWith('Hello World {{test}}');

    await userEvent.type(editor, `{${controlKey}>}z{/${controlKey}}`);

    expect(editor).toHaveTextContent('');
    expect(args.onPersist).toHaveBeenLastCalledWith('');

    await userEvent.type(
      editor,
      `{Shift>}{${controlKey}>}z{/${controlKey}}{/Shift}`,
    );

    expect(editor).toHaveTextContent('Hello World test');
    expect(args.onPersist).toHaveBeenLastCalledWith('Hello World {{test}}');
  },
};
