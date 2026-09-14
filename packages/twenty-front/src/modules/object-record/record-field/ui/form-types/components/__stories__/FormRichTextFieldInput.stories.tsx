import { FormRichTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormRichTextFieldInput';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

const BLOCKNOTE_PARAGRAPH = JSON.stringify([
  {
    id: 'block-1',
    type: 'paragraph',
    props: {},
    content: [{ type: 'text', text: 'Rich Text', styles: {} }],
  },
]);

const BLOCKNOTE_BULLET_LIST = JSON.stringify([
  {
    id: 'block-1',
    type: 'bulletListItem',
    props: {},
    content: [{ type: 'text', text: 'First item', styles: {} }],
  },
  {
    id: 'block-2',
    type: 'bulletListItem',
    props: {},
    content: [{ type: 'text', text: 'Second item', styles: {} }],
  },
]);

const meta: Meta<typeof FormRichTextFieldInput> = {
  title: 'UI/Data/Field/Form/Input/FormRichTextFieldInput',
  component: FormRichTextFieldInput,
  args: {},
  argTypes: {},
};

export default meta;

type Story = StoryObj<typeof FormRichTextFieldInput>;

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

export const WithBlocknoteContent: Story = {
  args: {
    defaultValue: { blocknote: BLOCKNOTE_PARAGRAPH, markdown: null },
    onChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Rich Text');
  },
};

export const WithBulletList: Story = {
  args: {
    defaultValue: { blocknote: BLOCKNOTE_BULLET_LIST, markdown: null },
    onChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('First item');
    await canvas.findByText('Second item');
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: { blocknote: BLOCKNOTE_PARAGRAPH, markdown: null },
    readonly: true,
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const editor = await waitFor(() => {
      const editorElement = canvasElement.querySelector('.ProseMirror');

      expect(editorElement).toBeVisible();

      return editorElement;
    });

    if (!editor) {
      throw new Error('Editor element not found');
    }

    await userEvent.type(editor, 'Hello');

    expect(args.onChange).not.toHaveBeenCalled();
    expect(canvas.queryByText('Hello')).not.toBeInTheDocument();
  },
};
