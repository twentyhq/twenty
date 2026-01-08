import { type Meta, type StoryObj } from '@storybook/react';
import {
  expect,
  fn,
  userEvent,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@storybook/test';
import { getUserDevice } from 'twenty-ui/utilities';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { MOCKED_STEP_ID } from '~/testing/mock-data/workflow';
import { FormRichTextV2FieldInput } from '@/object-record/record-field/ui/form-types/components/FormRichTextV2FieldInput';

const meta: Meta<typeof FormRichTextV2FieldInput> = {
  title: 'UI/Data/Field/Form/Input/FormRichTextV2FieldInput',
  component: FormRichTextV2FieldInput,
  args: {},
  argTypes: {},
  decorators: [WorkflowStepDecorator, I18nFrontDecorator],
};

export default meta;

type Story = StoryObj<typeof FormRichTextV2FieldInput>;

export const Default: Story = {
  args: {
    placeholder: 'Rich Text field...',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Rich Text',
    placeholder: 'Rich Text field...',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Rich Text');
  },
};

export const WithVariable: Story = {
  args: {
    label: 'Rich Text',
    placeholder: 'Rich Text field...',
    defaultValue: { blocknote: null, markdown: '## Title\nVariable: ' },
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
    const canvas = within(canvasElement);

    const editor = await waitFor(() => {
      const editor = canvasElement.querySelector('.ProseMirror > p');

      expect(editor).toBeVisible();

      return editor;
    });

    if (!editor) {
      throw new Error('Editor element not found');
    }

    await userEvent.click(editor);

    const addVariableButton = await canvas.findByRole('button', {
      name: 'Add variable',
    });

    await userEvent.click(addVariableButton);

    const variable = await canvas.findByText('Name');
    expect(variable).toBeVisible();

    await waitFor(() => {
      expect(args.onChange).toHaveBeenCalledWith({
        blocknote:
          '[{"type":"paragraph","content":[{"type":"text","text":"## Title"},{"type":"hardBreak"},{"type":"text","text":"Variable: "},{"type":"variableTag","attrs":{"variable":"{{04d5f3bf-9714-400d-ba27-644006a5fb1b.name}}"}}]}]',
        markdown: null,
      });
    });
    expect(args.onChange).toHaveBeenCalledTimes(1);
  },
};

export const WithDeletableVariable: Story = {
  args: {
    label: 'Text',
    placeholder: 'Text field...',
    defaultValue: {
      blocknote: null,
      markdown: `test {{${MOCKED_STEP_ID}.name}} test`,
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

    const variable = await canvas.findByText('Name');
    expect(variable).toBeVisible();

    const deleteVariableButton = await canvas.findByRole('button', {
      name: 'Remove variable',
    });

    await Promise.all([
      waitForElementToBeRemoved(variable),

      deleteVariableButton.click(),
    ]);

    expect(editor).toHaveTextContent('test test');

    await waitFor(() => {
      expect(args.onChange).toHaveBeenCalledWith({
        blocknote:
          '[{"type":"paragraph","content":[{"type":"text","text":"test  test"}]}]',
        markdown: null,
      });
    });
    expect(args.onChange).toHaveBeenCalledTimes(1);
  },
};

export const Disabled: Story = {
  args: {
    label: 'Text',
    placeholder: 'Text field...',
    defaultValue: {
      blocknote: null,
      markdown: 'Rich Text',
    },
    readonly: true,
    VariablePicker: () => <div>VariablePicker</div>,
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

    const variablePicker = canvas.queryByText('VariablePicker');
    expect(variablePicker).not.toBeInTheDocument();

    const defaultValue = await canvas.findByText('Rich Text');
    expect(defaultValue).toBeVisible();

    await userEvent.type(editor, 'Hello');

    expect(args.onChange).not.toHaveBeenCalled();
    expect(canvas.queryByText('Hello')).not.toBeInTheDocument();
    expect(defaultValue).toBeVisible();
  },
};

export const DisabledWithVariable: Story = {
  args: {
    label: 'Text',
    defaultValue: {
      blocknote: null,
      markdown: `test {{${MOCKED_STEP_ID}.name}} test`,
    },
    readonly: true,
  },
  play: async ({ canvasElement }) => {
    const editor = await waitFor(() => {
      const editor = canvasElement.querySelector('.ProseMirror > p');

      expect(editor).toBeVisible();

      return editor;
    });

    await waitFor(() => {
      expect(editor).toHaveTextContent('test Name test');
    });

    const deleteVariableButton = within(editor as HTMLElement).queryByRole(
      'button',
    );
    expect(deleteVariableButton).not.toBeInTheDocument();
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

    await userEvent.type(editor, 'Hello World ');

    await userEvent.click(addVariableButton);

    expect(args.onChange).toHaveBeenLastCalledWith({
      blocknote:
        '[{"type":"paragraph","content":[{"type":"text","text":"Hello World "},{"type":"variableTag","attrs":{"variable":"{{04d5f3bf-9714-400d-ba27-644006a5fb1b.name}}"}}]}]',
      markdown: null,
    });

    await userEvent.type(editor, `{${controlKey}>}z{/${controlKey}}`);

    expect(editor).toHaveTextContent('');
    expect(args.onChange).toHaveBeenLastCalledWith({
      blocknote: '[{"type":"paragraph"}]',
      markdown: null,
    });

    await userEvent.type(
      editor,
      `{Shift>}{${controlKey}>}z{/${controlKey}}{/Shift}`,
    );

    expect(editor).toHaveTextContent(`Hello World Name`);
    expect(args.onChange).toHaveBeenLastCalledWith({
      blocknote:
        '[{"type":"paragraph","content":[{"type":"text","text":"Hello World "},{"type":"variableTag","attrs":{"variable":"{{04d5f3bf-9714-400d-ba27-644006a5fb1b.name}}"}}]}]',
      markdown: null,
    });
  },
};
