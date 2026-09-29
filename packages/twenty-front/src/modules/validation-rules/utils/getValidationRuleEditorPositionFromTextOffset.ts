import { type Node as ProseMirrorNode } from '@tiptap/pm/model';

import { getValidationRuleEditorNodeTextLength } from '@/validation-rules/utils/getValidationRuleEditorNodeTextLength';

const PARAGRAPH_CONTENT_START_POSITION = 1;

export const getValidationRuleEditorPositionFromTextOffset = (
  document: ProseMirrorNode,
  textOffset: number,
): number => {
  const paragraph = document.firstChild;

  let position = PARAGRAPH_CONTENT_START_POSITION;
  let consumedTextLength = 0;

  for (const node of paragraph?.children ?? []) {
    const nodeTextLength = getValidationRuleEditorNodeTextLength(node);

    if (textOffset <= consumedTextLength + nodeTextLength) {
      if (node.isText) {
        return position + textOffset - consumedTextLength;
      }

      return textOffset === consumedTextLength + nodeTextLength
        ? position + node.nodeSize
        : position;
    }

    consumedTextLength += nodeTextLength;
    position += node.nodeSize;
  }

  return position;
};
