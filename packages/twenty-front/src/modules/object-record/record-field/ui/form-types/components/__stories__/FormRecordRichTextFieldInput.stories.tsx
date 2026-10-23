import { FormRecordRichTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormRecordRichTextFieldInput';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type JSONContent } from '@tiptap/core';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { TIPTAP_DOCUMENT_SCHEMA_VERSION } from 'twenty-shared/utils';
import { ComponentDecorator } from 'twenty-ui/testing';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const serializeDocument = (content: JSONContent[]) =>
  JSON.stringify({
    type: 'doc',
    content,
    attrs: { schemaVersion: TIPTAP_DOCUMENT_SCHEMA_VERSION },
  });

const TIPTAP_PARAGRAPH = serializeDocument([
  { type: 'paragraph', content: [{ type: 'text', text: 'Rich Text' }] },
]);

const TIPTAP_BULLET_LIST = serializeDocument([
  {
    type: 'bulletList',
    content: [
      {
        type: 'listItem',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'First item' }],
          },
        ],
      },
      {
        type: 'listItem',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Second item' }],
          },
        ],
      },
    ],
  },
]);

const LEGACY_BLOCKNOTE_BULLET_LIST = JSON.stringify([
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

const meta: Meta<typeof FormRecordRichTextFieldInput> = {
  title: 'UI/Data/Field/Form/Input/FormRecordRichTextFieldInput',
  component: FormRecordRichTextFieldInput,
  decorators: [
    ObjectMetadataItemsDecorator,
    ToastDecorator,
    MemoryRouterDecorator,
    ComponentDecorator,
  ],
  parameters: {
    msw: graphqlMocks,
  },
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
    defaultValue: { tiptap: TIPTAP_BULLET_LIST, markdown: null },
    onChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('First item');
    await canvas.findByText('Second item');
  },
};

export const WithLegacyBlockNoteBulletList: Story = {
  args: {
    defaultValue: { blocknote: LEGACY_BLOCKNOTE_BULLET_LIST, markdown: null },
    onChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('First item');
    await canvas.findByText('Second item');
  },
};

export const WritesTipTapDocument: Story = {
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

    expect(args.onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        tiptap: expect.stringContaining('"text":"Hello"'),
        markdown: null,
      }),
    );
  },
};

export const KeepsContentAcrossFullScreen: Story = {
  args: {
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

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

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Expand to full screen' }),
    );

    await page.findByText('Text Editor');
    expect(await page.findByText('Hello')).toBeVisible();

    await userEvent.keyboard(' world');

    await userEvent.click(
      await page.findByRole('button', { name: 'Close page' }),
    );

    expect(await canvas.findByText('Hello world')).toBeVisible();
    expect(page.queryByText('Text Editor')).not.toBeInTheDocument();
    expect(args.onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        tiptap: expect.stringContaining('Hello world'),
      }),
    );
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: { tiptap: TIPTAP_PARAGRAPH, markdown: null },
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
