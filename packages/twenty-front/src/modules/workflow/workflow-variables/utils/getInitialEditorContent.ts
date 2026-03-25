import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';
import { isNonEmptyString } from '@sniptt/guards';
import type { JSONContent } from '@tiptap/react';

export const CAPTURE_VARIABLE_TAG_REGEX = /({{[^{}]+}})/;

export const getInitialEditorContent = (rawContent: string): JSONContent => {
  const paragraphContent: JSONContent[] = [];
  const lines = rawContent.split(/\n/);

  lines.forEach((line, index) => {
    const parts = line.split(CAPTURE_VARIABLE_TAG_REGEX);

    parts.forEach((part) => {
      if (isStandaloneVariableString(part)) {
        paragraphContent.push({
          type: 'variableTag',
          attrs: { variable: part },
        });
      } else if (isNonEmptyString(part)) {
        paragraphContent.push({
          type: 'text',
          text: part,
        });
      }
    });

    if (index < lines.length - 1) {
      paragraphContent.push({
        type: 'hardBreak',
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
