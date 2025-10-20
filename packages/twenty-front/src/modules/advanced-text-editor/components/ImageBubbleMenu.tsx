import { BubbleMenuIconButton } from '@/advanced-text-editor/components/BubbleMenuIconButton';
import { StyledBubbleMenuContainer } from '@/advanced-text-editor/components/TextBubbleMenu';
import { type Editor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import {
  IconAlignCenter,
  IconAlignLeft,
  IconAlignRight,
  IconTrash,
} from 'twenty-ui/display';

type ImageBubbleMenuProps = {
  editor: Editor;
};

export const ImageBubbleMenu = ({ editor }: ImageBubbleMenuProps) => {
  const state = useEditorState({
    editor,
    selector: (ctx) => {
      return {
        align: ctx.editor.getAttributes('image').align || 'left',
      };
    },
  });

  const handleDelete = () => {
    editor.chain().focus().deleteSelection().run();
  };

  const alignmentActions = [
    {
      align: 'left',
      Icon: IconAlignLeft,
      onClick: () =>
        editor
          .chain()
          .focus()
          .updateAttributes('image', { align: 'left' })
          .run(),
      isActive: state.align === 'left',
    },
    {
      align: 'center',
      Icon: IconAlignCenter,
      onClick: () =>
        editor
          .chain()
          .focus()
          .updateAttributes('image', { align: 'center' })
          .run(),
      isActive: state.align === 'center',
    },
    {
      align: 'right',
      Icon: IconAlignRight,
      onClick: () =>
        editor
          .chain()
          .focus()
          .updateAttributes('image', { align: 'right' })
          .run(),
      isActive: state.align === 'right',
    },
  ];

  const handleShouldShow = () => {
    return editor.isActive('image');
  };

  return (
    <BubbleMenu
      pluginKey="image-bubble-menu"
      editor={editor}
      shouldShow={handleShouldShow}
      updateDelay={0}
    >
      <StyledBubbleMenuContainer>
        {alignmentActions.map(({ align, Icon, onClick, isActive }) => (
          <BubbleMenuIconButton
            key={`image-align-${align}`}
            Icon={Icon}
            onClick={onClick}
            isActive={isActive}
          />
        ))}
        <BubbleMenuIconButton
          key="image-delete"
          Icon={IconTrash}
          onClick={handleDelete}
          isActive={false}
        />
      </StyledBubbleMenuContainer>
    </BubbleMenu>
  );
};
