import { type JSONContent } from '@tiptap/core';
import { Fragment, type ReactNode } from 'react';
import { TIPTAP_NODE_TYPES, type TipTapNodeType } from 'twenty-shared/utils';
import { heading } from '../nodes/heading';
import { image } from '../nodes/image';
import { paragraph } from '../nodes/paragraph';
import { text } from '../nodes/text';
import { variableTag } from '../nodes/variable-tag';

const NODE_RENDERERS = {
  [TIPTAP_NODE_TYPES.PARAGRAPH]: paragraph,
  [TIPTAP_NODE_TYPES.TEXT]: text,
  [TIPTAP_NODE_TYPES.HEADING]: heading,
  [TIPTAP_NODE_TYPES.VARIABLE_TAG]: variableTag,
  [TIPTAP_NODE_TYPES.IMAGE]: image,
};

const renderNode = (node: JSONContent): ReactNode => {
  const renderer = NODE_RENDERERS[node.type as TipTapNodeType];

  if (!renderer) {
    return null;
  }

  return renderer(node);
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
