import { useLiveEditorState } from '@/advanced-text-editor/hooks/useLiveEditorState';
import { type Editor } from '@tiptap/core';

export const useTextBubbleState = (editor: Editor) => {
  const state = useLiveEditorState(editor, (currentEditor) => {
    return {
      isBold: currentEditor.isActive('bold'),
      isItalic: currentEditor.isActive('italic'),
      isStrike: currentEditor.isActive('strike'),
      isUnderline: currentEditor.isActive('underline'),
      isLink: currentEditor.isActive('link'),
      linkHref: currentEditor.getAttributes('link').href || '',
      isBulletList: currentEditor.isActive('bulletList'),
      isOrderedList: currentEditor.isActive('orderedList'),
    };
  });

  return state;
};
