import {
  isDefined,
  parseCanonicalTipTapJsonDocument,
  TIPTAP_NODE_TYPES,
  type TipTapNode,
} from 'twenty-shared/utils';

const getMentionNodesFromNode = (node: TipTapNode): TipTapNode[] => [
  ...(node.type === TIPTAP_NODE_TYPES.MENTION_TAG ? [node] : []),
  ...(node.content ?? []).flatMap(getMentionNodesFromNode),
];

export const getAiChatMentionNodes = (
  serializedDocument: string,
): TipTapNode[] => {
  const document = parseCanonicalTipTapJsonDocument(serializedDocument);

  return isDefined(document) ? getMentionNodesFromNode(document) : [];
};
