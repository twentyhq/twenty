import {
  isDefined,
  parseCanonicalTipTapJsonDocument,
  TIPTAP_NODE_TYPES,
  type TipTapNode,
} from 'twenty-shared/utils';

const isRecordMentionedInNode = (node: TipTapNode, recordId: string): boolean =>
  (node.type === TIPTAP_NODE_TYPES.MENTION_TAG &&
    node.attrs?.recordId === recordId) ||
  (node.content ?? []).some((childNode) =>
    isRecordMentionedInNode(childNode, recordId),
  );

export const isRecordMentionedInSerializedDocument = ({
  serializedDocument,
  recordId,
}: {
  serializedDocument: string;
  recordId: string;
}) => {
  const document = parseCanonicalTipTapJsonDocument(serializedDocument);

  return isDefined(document) && isRecordMentionedInNode(document, recordId);
};
