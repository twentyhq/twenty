import { bulletList } from '@/utils/email-renderer/nodes/bullet-list';
import { button } from '@/utils/email-renderer/nodes/button';
import { columns } from '@/utils/email-renderer/nodes/columns';
import { divider } from '@/utils/email-renderer/nodes/divider';
import { html } from '@/utils/email-renderer/nodes/html';
import { section } from '@/utils/email-renderer/nodes/section';
import { hardBreak } from '@/utils/email-renderer/nodes/hard-break';
import { heading } from '@/utils/email-renderer/nodes/heading';
import { image } from '@/utils/email-renderer/nodes/image';
import { listItem } from '@/utils/email-renderer/nodes/list-item';
import { orderedList } from '@/utils/email-renderer/nodes/ordered-list';
import { paragraph } from '@/utils/email-renderer/nodes/paragraph';
import { text } from '@/utils/email-renderer/nodes/text';
import { variableTag } from '@/utils/email-renderer/nodes/variable-tag';
import { type JSONContent } from '@tiptap/core';
import { Fragment, type JSX, type ReactNode } from 'react';
import { type InheritedTypography } from 'src/utils/email-renderer/utils/inherited-typography';
import {
  EMAIL_DOCUMENT_NODE_TYPES,
  isRenderedEmailDocumentNodeType,
  type RenderedEmailDocumentNodeType,
} from 'twenty-shared/utils';

type EmailNodeRenderer = (
  node: JSONContent,
  inherited: InheritedTypography,
) => ReactNode;

const NODE_RENDERERS = {
  [EMAIL_DOCUMENT_NODE_TYPES.PARAGRAPH]: paragraph,
  [EMAIL_DOCUMENT_NODE_TYPES.TEXT]: text,
  [EMAIL_DOCUMENT_NODE_TYPES.HEADING]: heading,
  [EMAIL_DOCUMENT_NODE_TYPES.VARIABLE_TAG]: variableTag,
  [EMAIL_DOCUMENT_NODE_TYPES.IMAGE]: image,
  [EMAIL_DOCUMENT_NODE_TYPES.BULLET_LIST]: bulletList,
  [EMAIL_DOCUMENT_NODE_TYPES.ORDERED_LIST]: orderedList,
  [EMAIL_DOCUMENT_NODE_TYPES.LIST_ITEM]: listItem,
  [EMAIL_DOCUMENT_NODE_TYPES.HARD_BREAK]: hardBreak,
  [EMAIL_DOCUMENT_NODE_TYPES.SECTION]: section,
  [EMAIL_DOCUMENT_NODE_TYPES.COLUMNS]: columns,
  [EMAIL_DOCUMENT_NODE_TYPES.BUTTON]: button,
  [EMAIL_DOCUMENT_NODE_TYPES.DIVIDER]: divider,
  [EMAIL_DOCUMENT_NODE_TYPES.HTML]: html,
} satisfies Record<RenderedEmailDocumentNodeType, EmailNodeRenderer>;

const renderNode = (
  node: JSONContent,
  inherited: InheritedTypography,
): ReactNode => {
  if (
    typeof node.type !== 'string' ||
    !isRenderedEmailDocumentNodeType(node.type)
  ) {
    return null;
  }

  return NODE_RENDERERS[node.type](node, inherited);
};

export const mappedNodeContent = (
  node: JSONContent,
  inherited: InheritedTypography = {},
): JSX.Element[] => {
  const allNodes = node.content || [];
  return allNodes
    .map((childNode, index) => {
      const component = renderNode(childNode, inherited);
      if (!component) {
        return null;
      }

      return <Fragment key={index}>{component}</Fragment>;
    })
    .filter((n) => n !== null);
};
