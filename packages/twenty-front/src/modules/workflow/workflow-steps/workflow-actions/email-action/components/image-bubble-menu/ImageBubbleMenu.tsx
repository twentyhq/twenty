import { BubbleMenuIconButton } from '@/workflow/workflow-steps/workflow-actions/email-action/components/text-bubble-menu/BubbleMenuIconButton';
import { StyledBubbleMenuContainer } from '@/workflow/workflow-steps/workflow-actions/email-action/components/text-bubble-menu/TextBubbleMenu';
import { isTextSelected } from '@/workflow/workflow-steps/workflow-actions/email-action/utils/isTextSelected';
import { type Editor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import {
  IconArrowLeft,
  IconArrowRight,
  IconPoint,
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
      Icon: IconArrowLeft,
      onClick: () =>
        editor
          .chain()
          .focus()
          .updateAttributes('image', { align: 'left' })
          .run(),
      isActive: state.align === 'left',
    },
    {
      Icon: IconPoint,
      onClick: () =>
        editor
          .chain()
          .focus()
          .updateAttributes('image', { align: 'center' })
          .run(),
      isActive: state.align === 'center',
    },
    {
      Icon: IconArrowRight,
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
    if (isTextSelected({ editor })) {
      return false;
    }

    return editor.isActive('image');
  };

  return (
    <BubbleMenu
      pluginKey="image-bubble-menu"
      editor={editor}
      shouldShow={handleShouldShow}
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
