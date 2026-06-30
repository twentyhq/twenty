import type { JSONContent } from '@tiptap/react';
import { isDefined } from 'twenty-shared/utils';

const isTagNode = (node: JSONContent): boolean => {
  return node.type === 'textTag' || node.type === 'variableTag';
};

const getTagValue = (node: JSONContent): string => {
  if (node.type === 'textTag') {
    return node.attrs?.text || '';
  }
  if (node.type === 'variableTag') {
    return node.attrs?.variable || '';
  }
  return '';
};

export const parseMultiItemEditorContent = (json: JSONContent): string => {
  const collectTags = (nodes: JSONContent[]): string[] => {
    const results: string[] = [];

    for (const node of nodes) {
      if (isTagNode(node)) {
        const value = getTagValue(node);
        if (value.length > 0) {
          results.push(value);
        }
      } else if (
        (node.type === 'paragraph' || node.type === 'doc') &&
        isDefined(node.content)
      ) {
        results.push(...collectTags(node.content));
      }
    }

    return results;
  };

  if (isDefined(json.content)) {
    return collectTags(json.content).join(', ');
  }

  return '';
};
