import { JSONContent } from '@tiptap/react';
import { isDefined } from 'twenty-ui';

export const parseEditorContent = (json: JSONContent): string => {
  const parseNode = (node: JSONContent): string => {
    if (
      (node.type === 'paragraph' || node.type === 'doc') &&
      isDefined(node.content)
    ) {
      return node.content.map(parseNode).join('');
    }

    if (node.type === 'text') {
      return node.text || '';
    }

    if (node.type === 'variableTag') {
      return node.attrs?.variable || '';
    }

    return '';
  };

  return parseNode(json);
};
