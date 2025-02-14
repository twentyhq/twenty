import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, waitFor, within } from '@storybook/test';
import { getUserDevice } from 'twenty-ui';
import { FormRawJsonFieldInput } from '../FormRawJsonFieldInput';

const meta: Meta<typeof FormRawJsonFieldInput> = {
  title: 'UI/Data/Field/Form/Input/FormRawJsonFieldInput',
  component: FormRawJsonFieldInput,
  args: {},
  argTypes: {},
};

export default meta;

type Story = StoryObj<typeof FormRawJsonFieldInput>;

export const Default: Story = {
  args: {
    label: 'JSON field',
    placeholder: 'Enter valid json',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('JSON field');
  },
};

export const Readonly: Story = {
  args: {
    label: 'JSON field',
    placeholder: 'Enter valid json',
    readonly: true,
    onPersist: fn(),
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
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const editor = canvasElement.querySelector('.ProseMirror > p');
    expect(editor).toBeVisible();

    await userEvent.type(editor, '{{ "a": {{ "b" :  "d" } }');

    await waitFor(() => {
      const allParagraphs = canvasElement.querySelectorAll('.ProseMirror > p');
      expect(allParagraphs).toHaveLength(1);
      expect(allParagraphs[0]).toHaveTextContent('');
    });

    expect(args.onPersist).not.toHaveBeenCalled();

    const addVariableButton = canvas.queryByText('Add variable');
    expect(addVariableButton).not.toBeInTheDocument();
  },
};

export const SaveValidJson: Story = {
  args: {
    placeholder: 'Enter valid json',
    onPersist: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const editor = canvasElement.querySelector('.ProseMirror > p');
    expect(editor).toBeVisible();

    await userEvent.type(editor, '{{ "a": {{ "b" :  "d" } }');

    await waitFor(() => {
      expect(args.onPersist).toHaveBeenCalledWith('{ "a": { "b" :  "d" } }');
    });
  },
};

export const SaveValidMultilineJson: Story = {
  args: {
    placeholder: 'Enter valid json',
    onPersist: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const editor = canvasElement.querySelector('.ProseMirror > p');
    expect(editor).toBeVisible();

    await userEvent.type(
      editor,
      '{{{Enter}  "a": {{{Enter}    "b" : "d"{Enter}  }{Enter}}',
    );

    await waitFor(() => {
      expect(args.onPersist).toHaveBeenCalledWith(
        '{\n  "a": {\n    "b" : "d"\n  }\n}',
      );
    });
  },
};

export const MultilineWithDefaultValue: Story = {
  args: {
    placeholder: 'Enter valid json',
    defaultValue: '{\n  "a": {\n    "b" : "d"\n  }\n}',
  },
  play: async ({ canvasElement }) => {
    const editor = canvasElement.querySelector('.ProseMirror > p');
    expect(editor).toBeVisible();

    await waitFor(() => {
      expect((editor as HTMLElement).innerText).toBe(
        '{\n  "a": {\n    "b" : "d"\n  }\n}',
      );
    });
  },
};

export const DoesNotIgnoreInvalidJson: Story = {
  args: {
    placeholder: 'Enter valid json',
    onPersist: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const editor = canvasElement.querySelector('.ProseMirror > p');
    expect(editor).toBeVisible();

    await userEvent.type(editor, 'lol');

    await userEvent.click(canvasElement);

    expect(args.onPersist).toHaveBeenCalledWith('lol');
  },
};

export const DisplayDefaultValueWithVariablesProperly: Story = {
  args: {
    placeholder: 'Enter valid json',
    defaultValue: '{ "a": { "b" :  {{var.test}} } }',
    onPersist: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText(/{ "a": { "b" : /);

    const variableTag = await canvas.findByText('test');
    await expect(variableTag).toBeVisible();

    await canvas.findByText(/ } }/);
  },
};

export const InsertVariableInTheMiddleOnTextInput: Story = {
  args: {
    placeholder: 'Enter valid json',
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
    const canvas = within(canvasElement);

    const editor = canvasElement.querySelector('.ProseMirror > p');
    expect(editor).toBeVisible();

    const addVariableButton = await canvas.findByRole('button', {
      name: 'Add variable',
    });

    await userEvent.type(editor, '{{ "a": {{ "b" : ');

    await userEvent.click(addVariableButton);

    await userEvent.type(editor, ' } }');

    await Promise.all([
      waitFor(() => {
        expect(args.onPersist).toHaveBeenCalledWith(
          '{ "a": { "b" : {{test}} } }',
        );
      }),
    ]);
  },
};

export const CanUseVariableAsObjectProperty: Story = {
  args: {
    placeholder: 'Enter valid json',
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
    const canvas = within(canvasElement);

    const editor = canvasElement.querySelector('.ProseMirror > p');
    expect(editor).toBeVisible();

    const addVariableButton = await canvas.findByRole('button', {
      name: 'Add variable',
    });

    await userEvent.type(editor, '{{ "');

    await userEvent.click(addVariableButton);

    await userEvent.type(editor, '": 2 }');

    await waitFor(() => {
      expect(args.onPersist).toHaveBeenCalledWith('{ "{{test}}": 2 }');
    });
  },
};

export const ClearField: Story = {
  args: {
    placeholder: 'Enter valid json',
    defaultValue: '{ "a": 2 }',
    onPersist: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const defaultValueStringLength = args.defaultValue!.length;

    const editor = canvasElement.querySelector('.ProseMirror > p');
    expect(editor).toBeVisible();

    await Promise.all([
      userEvent.type(editor, `{Backspace>${defaultValueStringLength}}`),

      waitFor(() => {
        expect(args.onPersist).toHaveBeenCalledWith(null);
      }),
    ]);
  },
};

/**
 * Line breaks are not authorized in JSON strings. Users should instead put newlines characters themselves.
 * See https://stackoverflow.com/a/42073.
 */
export const DoesNotBreakWhenUserInsertsNewlineInJsonString: Story = {
  args: {
    placeholder: 'Enter valid json',
    onPersist: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const editor = canvasElement.querySelector('.ProseMirror > p');
    expect(editor).toBeVisible();

    await userEvent.type(editor, '"a{Enter}b"');

    await userEvent.click(canvasElement);

    expect(args.onPersist).toHaveBeenCalled();
  },
};

export const AcceptsJsonEncodedNewline: Story = {
  args: {
    placeholder: 'Enter valid json',
    onPersist: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const editor = canvasElement.querySelector('.ProseMirror > p');
    expect(editor).toBeVisible();

    await userEvent.type(editor, '"a\\nb"');

    await userEvent.click(canvasElement);

    expect(args.onPersist).toHaveBeenCalledWith('"a\\nb"');
  },
};

export const HasHistory: Story = {
  args: {
    placeholder: 'Enter valid json',
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

    await userEvent.type(editor, '{{ "a": ');

    await userEvent.click(addVariableButton);

    await userEvent.type(editor, ' }');

    expect(args.onPersist).toHaveBeenLastCalledWith('{ "a": {{test}} }');

    await userEvent.type(editor, `{${controlKey}>}z{/${controlKey}}`);

    expect(editor).toHaveTextContent('');
    expect(args.onPersist).toHaveBeenLastCalledWith(null);

    await userEvent.type(
      editor,
      `{Shift>}{${controlKey}>}z{/${controlKey}}{/Shift}`,
    );

    expect(editor).toHaveTextContent('{ "a": test }');
    expect(args.onPersist).toHaveBeenLastCalledWith('{ "a": {{test}} }');
  },
};
