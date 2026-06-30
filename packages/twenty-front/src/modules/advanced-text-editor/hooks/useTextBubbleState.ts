import { type Editor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';

export const useTextBubbleState = (editor: Editor) => {
  const state = useEditorState({
    editor,
    selector: (ctx) => {
      return {
        isBold: ctx.editor.isActive('bold'),
        isItalic: ctx.editor.isActive('italic'),
        isStrike: ctx.editor.isActive('strike'),
        isUnderline: ctx.editor.isActive('underline'),
        isLink: ctx.editor.isActive('link'),
        linkHref: ctx.editor.getAttributes('link').href || '',
        isBulletList: ctx.editor.isActive('bulletList'),
        isOrderedList: ctx.editor.isActive('orderedList'),
      };
    },
  });

  return state;
};
