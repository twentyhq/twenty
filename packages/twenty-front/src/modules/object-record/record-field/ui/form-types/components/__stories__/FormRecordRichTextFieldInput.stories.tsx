import { FormRecordRichTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormRecordRichTextFieldInput';
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

const TIPTAP_BULLET_LIST = JSON.stringify([
  {
    type: 'bulletList',
    content: [
      {
        type: 'listItem',
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'Item' }] },
        ],
      },
    ],
  },
]);

const meta: Meta<typeof FormRecordRichTextFieldInput> = {
  title: 'UI/Data/Field/Form/Input/FormRecordRichTextFieldInput',
  component: FormRecordRichTextFieldInput,
  args: {},
  argTypes: {},
};

export default meta;

type Story = StoryObj<typeof FormRecordRichTextFieldInput>;

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

export const WritesBlockNoteBlocks: Story = {
  args: {
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const editor = await waitFor(() => {
      const editorElement = canvasElement.querySelector('.ProseMirror');

      expect(editorElement).toBeVisible();

      return editorElement;
    });

    if (!editor) {
      throw new Error('Editor element not found');
    }

    await userEvent.click(editor);
    await userEvent.keyboard('Hello');

    await waitFor(() => {
      expect(args.onChange).toHaveBeenCalled();
    });

    const lastCall = (args.onChange as jest.Mock).mock.calls.at(-1)?.[0];
    const blocks = JSON.parse(lastCall.blocknote);

    expect(lastCall.markdown).toBeNull();
    expect(Array.isArray(blocks)).toBe(true);
    expect(blocks[0]).toHaveProperty('id');
    expect(blocks[0]).toHaveProperty('props');
    expect(blocks[0].type).toBe('paragraph');
  },
};

export const DoesNotMountLegacyTipTapContent: Story = {
  args: {
    defaultValue: { blocknote: TIPTAP_BULLET_LIST, markdown: null },
    onChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(canvasElement.querySelector('.ProseMirror')).toBeVisible();
    });

    expect(canvas.queryByText('Item')).not.toBeInTheDocument();
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

    const defaultValue = await canvas.findByText('Rich Text');

    await userEvent.type(editor, 'Hello');

    expect(args.onChange).not.toHaveBeenCalled();
    expect(defaultValue).toBeVisible();
  },
};
