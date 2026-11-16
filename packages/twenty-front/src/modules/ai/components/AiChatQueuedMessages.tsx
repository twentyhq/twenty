import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { isAiChatMessageOwn } from '@/ai/utils/isAiChatMessageOwn';
import { isAiChatQueuedMessageRemovable } from '@/ai/utils/isAiChatQueuedMessageRemovable';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { getAiChatSenderLabel } from '@/ai/utils/getAiChatSenderLabel';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';
import { AiChatQueuedMessageList } from '@/ai/components/AiChatQueuedMessageList';
import { useDeleteQueuedMessage } from '@/ai/hooks/useDeleteQueuedMessage';
import { useIsCurrentAiChatThreadReadOnly } from '@/ai/hooks/useIsCurrentAiChatThreadReadOnly';
import { aiChatQueuedMessagesFamilyState } from '@/ai/states/aiChatQueuedMessagesFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

export const AiChatQueuedMessages = () => {
  const isReadOnly = useIsCurrentAiChatThreadReadOnly();
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const aiChatQueuedMessages = useAtomFamilyStateValue(
    aiChatQueuedMessagesFamilyState,
    { threadId: currentAiChatThread },
  );
  const { deleteQueuedMessage } = useDeleteQueuedMessage();

  if (
    !isDefined(currentAiChatThread) ||
    !isNonEmptyArray(aiChatQueuedMessages)
  ) {
    return null;
  }

  const hasOtherSenders = aiChatQueuedMessages.some(
    (message) =>
      isDefined(message.metadata?.senderWorkspaceMemberId) &&
      !isAiChatMessageOwn({
        message,
        currentWorkspaceMemberId: currentWorkspaceMember?.id,
        isSenderlessUserMessageOwn: !isAiChatInboxEnabled,
      }),
  );
  const messages = aiChatQueuedMessages.map((message) => {
    const senderId = message.metadata?.senderWorkspaceMemberId;
    const isCurrentWorkspaceMember = isAiChatMessageOwn({
      message,
      currentWorkspaceMemberId: currentWorkspaceMember?.id,
      isSenderlessUserMessageOwn: !isAiChatInboxEnabled,
    });
    const queuedMessage = {
      id: message.id,
      text: message.parts.find((part) => part.type === 'text')?.text ?? '',
      isRemovable: isAiChatQueuedMessageRemovable({
        message,
        currentWorkspaceMemberId: currentWorkspaceMember?.id,
        isAiChatInboxEnabled,
        isReadOnly,
      }),
    };

    if (!hasOtherSenders || !isDefined(senderId)) {
      return queuedMessage;
    }

    const sender = currentWorkspaceMembers.find(
      (member) => member.id === senderId,
    );

    return {
      ...queuedMessage,
      sender: {
        id: senderId,
        name: getAiChatSenderLabel({
          sender,
          isCurrentWorkspaceMember,
        }),
        avatarUrl: getAbsoluteImageUrl(sender?.avatarUrl),
      },
    };
  });

  return (
    <AiChatQueuedMessageList
      messages={messages}
      onRemove={isReadOnly ? undefined : deleteQueuedMessage}
    />
  );
};
