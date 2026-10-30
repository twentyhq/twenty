import { AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR } from 'twenty-shared/ai';
import {
  isDefined,
  parseCanonicalTipTapJsonDocument,
  TIPTAP_NODE_TYPES,
  type TipTapNode,
} from 'twenty-shared/utils';

const isAssistantMentionedInNode = (node: TipTapNode): boolean =>
  (node.type === TIPTAP_NODE_TYPES.MENTION_TAG &&
    node.attrs?.objectNameSingular ===
      AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR) ||
  (node.content ?? []).some(isAssistantMentionedInNode);

export const isAgentChatAssistantMentionedInSerializedDocument = (
  serializedDocument: string,
): boolean => {
  const document = parseCanonicalTipTapJsonDocument(serializedDocument);

  return isDefined(document) && isAssistantMentionedInNode(document);
};
