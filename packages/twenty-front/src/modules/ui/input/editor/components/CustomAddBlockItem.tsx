import { blockSchema } from '@/activities/blocks/schema';

type CustomAddBlockItemProps = {
  editor: typeof blockSchema.BlockNoteEditor;
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
  const handleClick = () => {
    const blockIdentifier = editor.getTextCursorPosition().block;
    const currentBlockContent = blockIdentifier?.content as
      | Array<ContentItem>
      | undefined;

    const [firstElement] = currentBlockContent || [];

    if (firstElement === undefined) {
      editor.openSelectionMenu('/');
    } else {
      editor.sideMenu.addBlock();
      editor.openSelectionMenu('/');
      editor.sideMenu.unfreezeMenu();
    }
  };
  return (
    <button
      className="mantine-focus-auto m_99ac2aa1 mantine-Menu-item bn-menu-item m_87cf2631 mantine-UnstyledButton-root"
      onClick={handleClick}
    >
      {children}
    </button>
  );
};
