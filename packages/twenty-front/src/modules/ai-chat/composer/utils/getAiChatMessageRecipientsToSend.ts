import { type createStore } from 'jotai';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { aiChatComposerNewThreadRecipientsFamilyState } from '@/ai-chat/composer/states/aiChatComposerNewThreadRecipientsFamilyState';
import { type AiChatNewThreadRecipients } from '@/ai-chat/composer/types/AiChatNewThreadRecipients';
import { getAiChatInitialRecipients } from '@/ai-chat/composer/utils/getAiChatInitialRecipients';
import { getParticipantMentionsFromSerializedDocument } from '@/ai-chat/composer/utils/getParticipantMentionsFromSerializedDocument';
import { isAiChatAssistantMentionedInSerializedDocument } from '@/ai-chat/composer/utils/isAiChatAssistantMentionedInSerializedDocument';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';

export const getAiChatMessageRecipientsToSend = ({
  store,
  threadId,
  isNewChat,
  isDirectMessage,
  newThreadRecipients,
  serializedContentToSend,
}: {
  store: ReturnType<typeof createStore>;
  threadId: string;
  isNewChat: boolean;
  isDirectMessage: boolean;
  newThreadRecipients: AiChatNewThreadRecipients | undefined;
  serializedContentToSend: string;
}) => {
  const currentWorkspaceMemberId = store.get(
    currentWorkspaceMemberState.atom,
  )?.id;
  const participantMentions = isDirectMessage
    ? []
    : getParticipantMentionsFromSerializedDocument(
        serializedContentToSend,
      ).filter(
        ({ workspaceMemberId }) =>
          workspaceMemberId !== currentWorkspaceMemberId,
      );
  const isAssistantMentioned = isAiChatAssistantMentionedInSerializedDocument(
    serializedContentToSend,
  );
  const channelId = isNewChat
    ? store.get(
        aiChatComposerNewThreadRecipientsFamilyState.atomFamily(threadId),
      ).channelId
    : undefined;
  const initialRecipients = getAiChatInitialRecipients({
    recipientWorkspaceMemberIds:
      newThreadRecipients?.recipientWorkspaceMemberIds ?? [],
    workspaceMembers: store.get(currentWorkspaceMembersState.atom),
  });
  const hasRecipients =
    newThreadRecipients?.isAssistantParticipant ||
    isAssistantMentioned ||
    isNonEmptyArray(initialRecipients) ||
    isNonEmptyArray(participantMentions) ||
    isDefined(channelId);

  return {
    participantMentions,
    isAssistantMentioned,
    channelId,
    initialRecipients,
    hasRecipients,
  };
};
