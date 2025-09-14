import { useTextBubbleState } from '@/workflow/workflow-steps/workflow-actions/email-action/hooks/useTextBubbleState';
import { type Editor } from '@tiptap/core';
import { BubbleMenu } from '@tiptap/react/menus';
import {
  IconBold,
  IconItalic,
  IconStrikethrough,
  IconUnderline,
} from 'twenty-ui/display';

import { FloatingIconButtonGroup } from 'twenty-ui/input';

type TextBubbleMenuProps = {
  editor: Editor;
};

export const TextBubbleMenu = ({ editor }: TextBubbleMenuProps) => {
  const state = useTextBubbleState(editor);
  const iconButtons = [
    {
      Icon: IconBold,
      onClick: () => editor.chain().focus().toggleBold().run(),
      isActive: state.isBold,
    },
    {
      Icon: IconItalic,
      onClick: () => editor.chain().focus().toggleItalic().run(),
      isActive: state.isItalic,
    },

    {
      Icon: IconUnderline,
      onClick: () => editor.chain().focus().toggleUnderline().run(),
      isActive: state.isUnderline,
    },

    {
      Icon: IconStrikethrough,
      onClick: () => editor.chain().focus().toggleStrike().run(),
      isActive: state.isStrike,
    },
  ];

  return (
    <BubbleMenu editor={editor}>
      <FloatingIconButtonGroup iconButtons={iconButtons} />
    </BubbleMenu>
  );
};
