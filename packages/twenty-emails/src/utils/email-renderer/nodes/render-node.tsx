import { type JSONContent } from '@tiptap/core';
import { Fragment, type ReactNode } from 'react';
import { heading } from 'src/utils/email-renderer/nodes/heading';
import { image } from 'src/utils/email-renderer/nodes/image';
import { paragraph } from 'src/utils/email-renderer/nodes/paragraph';
import { text } from 'src/utils/email-renderer/nodes/text';
import { variableTag } from 'src/utils/email-renderer/nodes/variable-tag';

const renderNode = (node: JSONContent): ReactNode => {
  switch (node.type) {
    case 'paragraph':
      return paragraph(node);
    case 'text':
      return text(node);
    case 'heading':
      return heading(node);
    case 'variableTag':
      return variableTag(node);
    case 'image':
      return image(node);
    default:
      return null;
  }
};

export const mappedNodeContent = (node: JSONContent): JSX.Element[] => {
  const allNodes = node.content || [];
  return allNodes
    .map((childNode, index) => {
      const component = renderNode(childNode);
      if (!component) {
        return null;
      }

      return <Fragment key={index}>{component}</Fragment>;
    })
    .filter((n) => n !== null);
};
