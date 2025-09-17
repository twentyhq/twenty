import { BubbleMenuIconButton } from '@/workflow/workflow-steps/workflow-actions/email-action/components/text-bubble-menu/BubbleMenuIconButton';
import { StyledBubbleMenuContainer } from '@/workflow/workflow-steps/workflow-actions/email-action/components/text-bubble-menu/TextBubbleMenu';
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
        {alignmentActions.map(({ Icon, onClick, isActive }, index) => (
          <BubbleMenuIconButton
            key={`image-bubble-menu-align-${index}`}
            Icon={Icon}
            onClick={onClick}
            isActive={isActive}
            size="medium"
          />
        ))}
        <BubbleMenuIconButton
          Icon={IconTrash}
          onClick={handleDelete}
          isActive={false}
          size="medium"
        />
      </StyledBubbleMenuContainer>
    </BubbleMenu>
  );
};
