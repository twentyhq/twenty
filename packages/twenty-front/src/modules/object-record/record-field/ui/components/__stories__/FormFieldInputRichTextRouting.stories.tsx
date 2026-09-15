import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { FieldMetadataType } from 'twenty-shared/types';
import { ComponentDecorator } from 'twenty-ui/testing';

import { FormFieldInput } from '@/object-record/record-field/ui/components/FormFieldInput';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const richTextField = {
  label: 'Body',
  type: FieldMetadataType.RICH_TEXT,
  metadata: {} as FieldMetadata,
};

const StubVariablePicker = () => <div data-testid="variable-picker" />;

const typeIntoEditor = async (canvasElement: HTMLElement, text: string) => {
  const editor = await waitFor(() => {
    const editorElement = canvasElement.querySelector('.ProseMirror');

    expect(editorElement).toBeVisible();

    return editorElement;
  });

  if (!editor) {
    throw new Error('Editor element not found');
  }

  await userEvent.click(editor);
  await userEvent.keyboard(text);
};

const meta: Meta<typeof FormFieldInput> = {
  title: 'UI/Data/Field/Form/Input/FormFieldInputRichTextRouting',
  component: FormFieldInput,
  decorators: [
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
    ComponentDecorator,
  ],
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

type Story = StoryObj<typeof FormFieldInput>;

export const WritesBlockNoteWhenStoringARecordColumn: Story = {
  args: {
    field: richTextField,
    defaultValue: null,
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    await typeIntoEditor(canvasElement, 'Hello');

    await waitFor(() => {
      expect(args.onChange).toHaveBeenCalled();
    });

    const [value] = (args.onChange as jest.Mock).mock.calls.at(-1) as [
      { blocknote: string },
    ];

    const blocks = JSON.parse(value.blocknote);

    expect(blocks[0]).toEqual(
      expect.objectContaining({
        type: 'paragraph',
        content: [expect.objectContaining({ styles: expect.any(Object) })],
      }),
    );
  },
};

export const KeepsTheVariableEditorWhenAPickerIsSupplied: Story = {
  args: {
    field: richTextField,
    defaultValue: null,
    onChange: fn(),
    VariablePicker: StubVariablePicker,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByTestId('variable-picker');
  },
};
