import '@blocknote/mantine/style.css';
import '@blocknote/react/style.css';

import { BlockNoteView } from '@blocknote/mantine';
import { SuggestionMenuController, useCreateBlockNote } from '@blocknote/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { IconH1, IconTextSize } from 'twenty-ui/icon';

import { CustomSlashMenu } from '@/blocknote-editor/components/CustomSlashMenu';
import { type SuggestionItem } from '@/blocknote-editor/types/SuggestionMenuItems';

const EditorWithSlashMenu = ({ onSelect }: { onSelect: () => void }) => {
  const editor = useCreateBlockNote({
    domAttributes: {
      editor: { role: 'textbox', 'aria-label': 'Block editor' },
    },
  });

  const items: SuggestionItem[] = [
    {
      title: 'First suggestion',
      Icon: IconTextSize,
      onItemClick: () => {
        onSelect();
        editor.insertInlineContent('First selection');
      },
    },
    {
      title: 'Second suggestion',
      Icon: IconH1,
      onItemClick: () => {
        onSelect();
        editor.insertInlineContent('Second selection');
      },
    },
  ];

  return (
    <BlockNoteView
      editor={editor}
      slashMenu={false}
      formattingToolbar={false}
      sideMenu={false}
    >
      <SuggestionMenuController
        triggerCharacter="/"
        getItems={async () => items}
        suggestionMenuComponent={CustomSlashMenu}
      />
    </BlockNoteView>
  );
};

const meta = {
  title: 'Modules/BlocknoteEditor/CustomSlashMenu',
  component: EditorWithSlashMenu,
  args: { onSelect: fn() },
} satisfies Meta<typeof EditorWithSlashMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const EditorOwnsKeyboardSelection: Story = {
  play: async ({ canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);
    const editor = await within(canvasElement).findByRole('textbox', {
      name: 'Block editor',
    });
    await userEvent.click(editor);
    await userEvent.keyboard('/');
    const firstOption = await body.findByRole('option', {
      name: 'First suggestion',
    });
    await expect(firstOption).toHaveAttribute('aria-selected', 'true');
    await expect(editor).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(
      body.getByRole('option', { name: 'Second suggestion' }),
    ).toHaveAttribute('aria-selected', 'true');
    await expect(firstOption).toHaveAttribute('aria-selected', 'false');
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(body.queryByRole('listbox')).not.toBeInTheDocument(),
    );
    await expect(args.onSelect).toHaveBeenCalledTimes(1);
    await expect(editor).toHaveTextContent('Second selection');
    await expect(editor).toHaveFocus();
  },
};

export const PointerKeepsEditorFocus: Story = {
  play: async ({ canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);
    const editor = await within(canvasElement).findByRole('textbox', {
      name: 'Block editor',
    });
    await userEvent.click(editor);
    await userEvent.keyboard('/');
    await userEvent.click(
      await body.findByRole('option', { name: 'Second suggestion' }),
    );
    await waitFor(() =>
      expect(body.queryByRole('listbox')).not.toBeInTheDocument(),
    );
    await expect(args.onSelect).toHaveBeenCalledTimes(1);
    await expect(editor).toHaveTextContent('Second selection');
    await expect(editor).toHaveFocus();
  },
};
