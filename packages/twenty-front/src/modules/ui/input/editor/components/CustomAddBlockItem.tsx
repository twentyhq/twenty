import { BLOCK_SCHEMA } from '@/activities/blocks/constants/Schema';

import { useComponentsContext } from '@blocknote/react';

type CustomAddBlockItemProps = {
  editor: typeof BLOCK_SCHEMA.BlockNoteEditor;
  children: React.ReactNode; // Adding the children prop
};

type ContentItem = {
  type: string;
  text: string;
  styles: any;
};
export const CustomAddBlockItem = ({
  editor,
  children,
}: CustomAddBlockItemProps) => {
  const Components = useComponentsContext();

  if (!Components) {
    return null;
  }

  const handleClick = () => {
    const blockIdentifier = editor.getTextCursorPosition().block;
    const currentBlockContent = blockIdentifier?.content as
      | Array<ContentItem>
      | undefined;

    const [firstElement] = currentBlockContent || [];

    if (firstElement === undefined) {
      editor.insertInlineContent('/');
    } else {
      const currentBlock = editor.getTextCursorPosition().block;

      editor.insertBlocks([{ type: 'paragraph' }], currentBlock, 'after');

      editor.insertInlineContent('/');
    }
  };
  return (
    <Components.Generic.Menu.Item onClick={handleClick}>
      {children}
    </Components.Generic.Menu.Item>
  );
};
