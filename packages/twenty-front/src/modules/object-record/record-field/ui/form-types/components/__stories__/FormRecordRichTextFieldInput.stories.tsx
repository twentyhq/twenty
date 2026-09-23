import { FormFieldEscapeContext } from '@/object-record/record-field/ui/contexts/FormFieldEscapeContext';
import { FormRecordRichTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormRecordRichTextFieldInput';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import {
  type Decorator,
  type Meta,
  type StoryObj,
} from '@storybook/react-vite';
import { type ReactNode } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Key } from 'ts-key-enum';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

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

const meta: Meta<typeof FormRecordRichTextFieldInput> = {
  title: 'UI/Data/Field/Form/Input/FormRecordRichTextFieldInput',
  component: FormRecordRichTextFieldInput,
  decorators: [
    ObjectMetadataItemsDecorator,
    ToastDecorator,
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

    expect(args.onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        blocknote: expect.stringContaining('"styles"'),
        markdown: null,
      }),
    );
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

const onFieldEscape = fn();

const CreationFormHotkeyScope = ({ children }: { children: ReactNode }) => {
  const containerRef = useHotkeysOnFocusedElement({
    keys: [`${Key.Meta}+${Key.Enter}`],
    focusId: 'record-creation-form',
    callback: () => {},
  });

  return (
    <div ref={containerRef}>
      <FormFieldEscapeContext.Provider value={onFieldEscape}>
        {children}
      </FormFieldEscapeContext.Provider>
    </div>
  );
};

const CreationFormDecorator: Decorator = (Story) => (
  <CreationFormHotkeyScope>
    <Story />
  </CreationFormHotkeyScope>
);

const focusEditor = async (canvasElement: HTMLElement) => {
  const editor = await waitFor(() => {
    const editorElement = canvasElement.querySelector('.ProseMirror');

    expect(editorElement).toBeVisible();

    return editorElement;
  });

  if (!editor) {
    throw new Error('Editor element not found');
  }

  await userEvent.click(editor);
};

export const LeavesFormOnEscape: Story = {
  args: {
    onChange: fn(),
  },
  decorators: [CreationFormDecorator],
  beforeEach: () => {
    onFieldEscape.mockClear();
  },
  play: async ({ canvasElement }) => {
    await focusEditor(canvasElement);

    await userEvent.keyboard('{Escape}');

    await waitFor(() => {
      expect(onFieldEscape).toHaveBeenCalledTimes(1);
    });
  },
};

export const ClosesSlashMenuBeforeLeavingForm: Story = {
  args: {
    onChange: fn(),
  },
  decorators: [CreationFormDecorator],
  beforeEach: () => {
    onFieldEscape.mockClear();
  },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await focusEditor(canvasElement);
    await userEvent.keyboard('/');
    expect(await body.findByText('Heading 1')).toBeVisible();

    await userEvent.keyboard('{Escape}');

    await waitFor(() => {
      expect(body.queryByText('Heading 1')).not.toBeInTheDocument();
    });
    expect(onFieldEscape).not.toHaveBeenCalled();

    await userEvent.keyboard('{Escape}');

    await waitFor(() => {
      expect(onFieldEscape).toHaveBeenCalledTimes(1);
    });
  },
};
