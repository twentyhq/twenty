import { isNonEmptyString } from '@sniptt/guards';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import {
  isDefined,
  parseCanonicalTipTapJsonDocument,
  TIPTAP_NODE_TYPES,
  type TipTapNode,
} from 'twenty-shared/utils';

import { type AgentChatParticipantMention } from '@/ai/types/AgentChatParticipantMention';

const getParticipantMentionsFromNode = (
  node: TipTapNode,
): AgentChatParticipantMention[] => {
  const workspaceMemberId = node.attrs?.recordId;
  const label = node.attrs?.label;

  const isParticipantMention =
    node.type === TIPTAP_NODE_TYPES.MENTION_TAG &&
    node.attrs?.objectNameSingular === CoreObjectNameSingular.WorkspaceMember &&
    node.attrs?.shouldAddAsParticipant === true &&
    isNonEmptyString(workspaceMemberId);

  return [
    ...(isParticipantMention
      ? [{ workspaceMemberId, label: isNonEmptyString(label) ? label : '' }]
      : []),
    ...(node.content ?? []).flatMap(getParticipantMentionsFromNode),
  ];
};

export const getParticipantMentionsFromSerializedDocument = (
  serializedDocument: string,
): AgentChatParticipantMention[] => {
  const document = parseCanonicalTipTapJsonDocument(serializedDocument);

  if (!isDefined(document)) {
    return [];
  }

  const participantMentions = getParticipantMentionsFromNode(document);

  return participantMentions.filter(
    ({ workspaceMemberId }, index) =>
      participantMentions.findIndex(
        (participantMention) =>
          participantMention.workspaceMemberId === workspaceMemberId,
      ) === index,
  );
};
