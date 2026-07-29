import { type JSONContent } from '@tiptap/core';
import { type JSX, Fragment, type ReactNode } from 'react';
import { TIPTAP_NODE_TYPES } from 'twenty-shared/utils';
import { bulletList } from '@/utils/email-renderer/nodes/bullet-list';
import { emailButton } from '@/utils/email-renderer/nodes/email-button';
import { emailColumns } from '@/utils/email-renderer/nodes/email-columns';
import { emailDivider } from '@/utils/email-renderer/nodes/email-divider';
import { emailSection } from '@/utils/email-renderer/nodes/email-section';
import { hardBreak } from '@/utils/email-renderer/nodes/hard-break';
import { heading } from '@/utils/email-renderer/nodes/heading';
import { image } from '@/utils/email-renderer/nodes/image';
import { listItem } from '@/utils/email-renderer/nodes/list-item';
import { orderedList } from '@/utils/email-renderer/nodes/ordered-list';
import { paragraph } from '@/utils/email-renderer/nodes/paragraph';
import { text } from '@/utils/email-renderer/nodes/text';
import { variableTag } from '@/utils/email-renderer/nodes/variable-tag';

const NODE_RENDERERS = {
  [TIPTAP_NODE_TYPES.PARAGRAPH]: paragraph,
  [TIPTAP_NODE_TYPES.TEXT]: text,
  [TIPTAP_NODE_TYPES.HEADING]: heading,
  [TIPTAP_NODE_TYPES.VARIABLE_TAG]: variableTag,
  [TIPTAP_NODE_TYPES.IMAGE]: image,
  [TIPTAP_NODE_TYPES.BULLET_LIST]: bulletList,
  [TIPTAP_NODE_TYPES.ORDERED_LIST]: orderedList,
  [TIPTAP_NODE_TYPES.LIST_ITEM]: listItem,
  [TIPTAP_NODE_TYPES.HARD_BREAK]: hardBreak,
  [TIPTAP_NODE_TYPES.EMAIL_SECTION]: emailSection,
  // emailColumns renders its emailColumn children itself because react-email
  // <Column> must sit directly under <Row>; a bare emailColumn outside a
  // columns row is not a valid document and stays unregistered.
  [TIPTAP_NODE_TYPES.EMAIL_COLUMNS]: emailColumns,
  [TIPTAP_NODE_TYPES.EMAIL_BUTTON]: emailButton,
  [TIPTAP_NODE_TYPES.EMAIL_DIVIDER]: emailDivider,
};

const renderNode = (node: JSONContent): ReactNode => {
  const renderer = NODE_RENDERERS[node.type as keyof typeof NODE_RENDERERS];

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
