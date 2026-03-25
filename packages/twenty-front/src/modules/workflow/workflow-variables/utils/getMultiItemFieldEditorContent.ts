import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';
import type { JSONContent } from '@tiptap/react';

export const getMultiItemFieldEditorContent = (
  rawContent: string,
): JSONContent => {
  const paragraphContent: JSONContent[] = [];

  const parts = rawContent.split(/,\s*/);

  parts.forEach((part) => {
    const trimmedPart = part.trim();

    if (trimmedPart.length === 0) {
      return;
    }

    if (isStandaloneVariableString(trimmedPart)) {
      paragraphContent.push({
        type: 'variableTag',
        attrs: { variable: trimmedPart },
      });
    } else {
      paragraphContent.push({
        type: 'textTag',
        attrs: { text: trimmedPart },
      });
    }
  });

  return {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: paragraphContent,
      },
    ],
  };
};
