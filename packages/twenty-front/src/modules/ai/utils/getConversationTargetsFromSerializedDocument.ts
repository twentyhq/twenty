import { isNonEmptyString } from '@sniptt/guards';
import {
  isDefined,
  parseCanonicalTipTapJsonDocument,
  TIPTAP_NODE_TYPES,
  type TipTapNode,
} from 'twenty-shared/utils';

import { type InboxConversationTarget } from '@/ai/types/AgentChatConversationTarget';

const getConversationTargetsFromNode = (
  node: TipTapNode,
): InboxConversationTarget[] => {
  const objectNameSingular = node.attrs?.objectNameSingular;
  const recordId = node.attrs?.recordId;

  const isConversationTargetMention =
    node.type === TIPTAP_NODE_TYPES.MENTION_TAG &&
    node.attrs?.isConversationTarget === true &&
    isNonEmptyString(objectNameSingular) &&
    isNonEmptyString(recordId);

  return [
    ...(isConversationTargetMention ? [{ objectNameSingular, recordId }] : []),
    ...(node.content ?? []).flatMap(getConversationTargetsFromNode),
  ];
};

export const getConversationTargetsFromSerializedDocument = (
  serializedDocument: string,
): InboxConversationTarget[] => {
  const document = parseCanonicalTipTapJsonDocument(serializedDocument);

  return isDefined(document) ? getConversationTargetsFromNode(document) : [];
};
