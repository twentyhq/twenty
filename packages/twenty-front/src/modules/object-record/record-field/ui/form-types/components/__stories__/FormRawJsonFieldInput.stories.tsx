import { type Meta, type StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { getUserDevice } from 'twenty-ui/utilities';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { MOCKED_STEP_ID } from '~/testing/mock-data/workflow';
import { FormRawJsonFieldInput } from '@/object-record/record-field/ui/form-types/components/FormRawJsonFieldInput';

const meta: Meta<typeof FormRawJsonFieldInput> = {
  title: 'UI/Data/Field/Form/Input/FormRawJsonFieldInput',
  component: FormRawJsonFieldInput,
  args: {},
  argTypes: {},
  decorators: [WorkflowStepDecorator, I18nFrontDecorator],
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
    onChange: fn(),
    VariablePicker: ({ onVariableSelect }) => {
      return (
        <button
          onClick={() => {
            onVariableSelect(`{{${MOCKED_STEP_ID}.name}}`);
          }}
        >
          Add variable
        </button>
      );
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const editor = await waitFor(() => {
      const editor = canvasElement.querySelector('.ProseMirror > p');
      expect(editor).toBeVisible();
      return editor;
    });

    if (!editor) {
      throw new Error('Editor element not found');
    }

    await userEvent.type(editor, '{{ "a": {{ "b" :  "d" } }');

    await waitFor(() => {
      const allParagraphs = canvasElement.querySelectorAll('.ProseMirror > p');
      expect(allParagraphs).toHaveLength(1);
      expect(allParagraphs[0]).toHaveTextContent('');
    });

    expect(args.onChange).not.toHaveBeenCalled();

    const addVariableButton = canvas.queryByText('Add variable');
    expect(addVariableButton).not.toBeInTheDocument();
  },
};

export const SaveValidJson: Story = {
  args: {
    placeholder: 'Enter valid json',
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const editor = await waitFor(() => {
      const editor = canvasElement.querySelector('.ProseMirror > p');
      expect(editor).toBeVisible();
      return editor;
    });

    if (!editor) {
      throw new Error('Editor element not found');
    }

    await userEvent.type(editor, '{{ "a": {{ "b" :  "d" } }');

    await waitFor(() => {
      expect(args.onChange).toHaveBeenCalledWith('{ "a": { "b" :  "d" } }');
    });
  },
};

export const SaveValidMultilineJson: Story = {
  args: {
    placeholder: 'Enter valid json',
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const editor = await waitFor(() => {
      const editor = canvasElement.querySelector('.ProseMirror > p');
      expect(editor).toBeVisible();
      return editor;
    });

    if (!editor) {
      throw new Error('Editor element not found');
    }

    await userEvent.type(
      editor,
      '{{{Enter}  "a": {{{Enter}    "b" : "d"{Enter}  }{Enter}}',
    );

    await waitFor(() => {
      expect(args.onChange).toHaveBeenCalledWith(
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
    const editor = await waitFor(() => {
      const editor = canvasElement.querySelector('.ProseMirror > p');
      expect(editor).toBeVisible();
      return editor;
    });

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
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const editor = await waitFor(() => {
      const editor = canvasElement.querySelector('.ProseMirror > p');
      expect(editor).toBeVisible();
      return editor;
    });

    if (!editor) {
      throw new Error('Editor element not found');
    }

    await userEvent.type(editor, 'lol');

    await userEvent.click(canvasElement);

    expect(args.onChange).toHaveBeenCalledWith('lol');
  },
};

export const DisplayDefaultValueWithVariablesProperly: Story = {
  args: {
    placeholder: 'Enter valid json',
    defaultValue: `{ "a": { "b" :  {{${MOCKED_STEP_ID}.name}} } }`,
    onChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText(/{ "a": { "b" : /);

    const variableTag = await canvas.findByText('Name');
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
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const editor = await waitFor(() => {
      const editor = canvasElement.querySelector('.ProseMirror > p');
      expect(editor).toBeVisible();
      return editor;
    });

    if (!editor) {
      throw new Error('Editor element not found');
    }

    const addVariableButton = await canvas.findByRole('button', {
      name: 'Add variable',
    });

    await userEvent.type(editor, '{{ "a": {{ "b" : ');

    await userEvent.click(addVariableButton);

    await userEvent.type(editor, ' } }');

    await Promise.all([
      waitFor(() => {
        expect(args.onChange).toHaveBeenCalledWith(
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
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const editor = await waitFor(() => {
      const editor = canvasElement.querySelector('.ProseMirror > p');
      expect(editor).toBeVisible();
      return editor;
    });

    if (!editor) {
      throw new Error('Editor element not found');
    }

    const addVariableButton = await canvas.findByRole('button', {
      name: 'Add variable',
    });

    await userEvent.type(editor, '{{ "');

    await userEvent.click(addVariableButton);

    await userEvent.type(editor, '": 2 }');

    await waitFor(() => {
      expect(args.onChange).toHaveBeenCalledWith('{ "{{test}}": 2 }');
    });
  },
};

export const ClearField: Story = {
  args: {
    placeholder: 'Enter valid json',
    defaultValue: '{ "a": 2 }',
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const defaultValueStringLength = args.defaultValue!.length;

    const editor = await waitFor(() => {
      const editor = canvasElement.querySelector('.ProseMirror > p');
      expect(editor).toBeVisible();
      return editor;
    });

    if (!editor) {
      throw new Error('Editor element not found');
    }

    await Promise.all([
      userEvent.type(editor, `{Backspace>${defaultValueStringLength}}`),

      waitFor(() => {
        expect(args.onChange).toHaveBeenCalledWith(null);
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
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const editor = await waitFor(() => {
      const editor = canvasElement.querySelector('.ProseMirror > p');
      expect(editor).toBeVisible();
      return editor;
    });

    if (!editor) {
      throw new Error('Editor element not found');
    }

    await userEvent.type(editor, '"a{Enter}b"');

    await userEvent.click(canvasElement);

    expect(args.onChange).toHaveBeenCalled();
  },
};

export const AcceptsJsonEncodedNewline: Story = {
  args: {
    placeholder: 'Enter valid json',
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const editor = await waitFor(() => {
      const editor = canvasElement.querySelector('.ProseMirror > p');
      expect(editor).toBeVisible();
      return editor;
    });

    if (!editor) {
      throw new Error('Editor element not found');
    }

    await userEvent.type(editor, '"a\\nb"');

    await userEvent.click(canvasElement);

    expect(args.onChange).toHaveBeenCalledWith('"a\\nb"');
  },
};

export const HasHistory: Story = {
  args: {
    placeholder: 'Enter valid json',
    VariablePicker: ({ onVariableSelect }) => {
      return (
        <button
          onClick={() => {
            onVariableSelect(`{{${MOCKED_STEP_ID}.name}}`);
          }}
        >
          Add variable
        </button>
      );
    },
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const controlKey = getUserDevice() === 'mac' ? 'Meta' : 'Control';

    const canvas = within(canvasElement);

    const editor = await waitFor(() => {
      const editor = canvasElement.querySelector('.ProseMirror > p');
      expect(editor).toBeVisible();
      return editor;
    });

    if (!editor) {
      throw new Error('Editor element not found');
    }

    const addVariableButton = await canvas.findByRole('button', {
      name: 'Add variable',
    });

    await userEvent.type(editor, '{{ "a": ');

    await userEvent.click(addVariableButton);

    await userEvent.type(editor, ' }');

    expect(args.onChange).toHaveBeenLastCalledWith(
      `{ "a": {{${MOCKED_STEP_ID}.name}} }`,
    );

    await userEvent.type(editor, `{${controlKey}>}z{/${controlKey}}`);

    expect(editor).toHaveTextContent('');
    expect(args.onChange).toHaveBeenLastCalledWith(null);

    await userEvent.type(
      editor,
      `{Shift>}{${controlKey}>}z{/${controlKey}}{/Shift}`,
    );

    expect(editor).toHaveTextContent('{ "a": Name }');
    expect(args.onChange).toHaveBeenLastCalledWith(
      `{ "a": {{${MOCKED_STEP_ID}.name}} }`,
    );
  },
};
