import { type BLOCK_SCHEMA } from '@/blocknote-editor/blocks/Schema';
import { SuggestionMenu } from '@blocknote/core/extensions';
import { useBlockNoteEditor, useComponentsContext } from '@blocknote/react';

type CustomAddBlockItemProps = {
  editor: typeof BLOCK_SCHEMA.BlockNoteEditor;
  children: React.ReactNode;
};

export const CustomAddBlockItem = ({
  editor,
  children,
}: CustomAddBlockItemProps) => {
  const Components = useComponentsContext();
  const blockNoteEditor = useBlockNoteEditor();

  if (!Components) {
    return null;
  }

  const handleClick = () => {
    const currentBlock = blockNoteEditor.getTextCursorPosition().block;
    const blockContent = currentBlock?.content;

    const isEmpty = Array.isArray(blockContent) && blockContent.length === 0;

    if (isEmpty) {
      editor.setTextCursorPosition(currentBlock);
    }

    blockNoteEditor.getExtension(SuggestionMenu)?.openSuggestionMenu('/');
  };

  return (
    <Components.Generic.Menu.Item onClick={handleClick}>
      {children}
    </Components.Generic.Menu.Item>
  );
};
