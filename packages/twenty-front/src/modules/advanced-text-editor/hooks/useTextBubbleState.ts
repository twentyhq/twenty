import { useLiveEditorState } from '@/advanced-text-editor/hooks/useLiveEditorState';
import { type Editor } from '@tiptap/core';
import {
  RICH_TEXT_COLORS,
  RICH_TEXT_TEXT_ALIGNMENTS,
} from 'twenty-shared/utils';

export const useTextBubbleState = (editor: Editor) => {
  const state = useLiveEditorState(editor, (currentEditor) => {
    const textStyleAttributes = currentEditor.getAttributes('textStyle');

    return {
      isBold: currentEditor.isActive('bold'),
      isItalic: currentEditor.isActive('italic'),
      isStrike: currentEditor.isActive('strike'),
      isUnderline: currentEditor.isActive('underline'),
      isCode: currentEditor.isActive('code'),
      isLink: currentEditor.isActive('link'),
      linkHref: currentEditor.getAttributes('link').href || '',
      isBulletList: currentEditor.isActive('bulletList'),
      isOrderedList: currentEditor.isActive('orderedList'),
      textColor:
        RICH_TEXT_COLORS.find(
          (color) => color === textStyleAttributes.textColor,
        ) ?? null,
      backgroundColor:
        RICH_TEXT_COLORS.find(
          (color) => color === textStyleAttributes.backgroundColor,
        ) ?? null,
      textAlignment:
        RICH_TEXT_TEXT_ALIGNMENTS.find((alignment) =>
          currentEditor.isActive({ textAlign: alignment }),
        ) ?? 'left',
    };
  });

  return state;
};
