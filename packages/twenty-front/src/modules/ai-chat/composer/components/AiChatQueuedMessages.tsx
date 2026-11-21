import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { isAiChatMessageOwn } from '@/ai-chat/messages/utils/isAiChatMessageOwn';
import { isAiChatQueuedMessageRemovable } from '@/ai-chat/composer/utils/isAiChatQueuedMessageRemovable';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { getAiChatSenderLabel } from '@/ai-chat/utils/getAiChatSenderLabel';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';
import { AiChatQueuedMessageList } from '@/ai-chat/composer/components/AiChatQueuedMessageList';
import { StyledAiChatContentContainer } from '@/ai-chat/components/StyledAiChatContentContainer';
import { AI_CHAT_PAGE_CONTENT_INLINE_PADDING } from '@/ai-chat/constants/AiChatPageContentInlinePadding';
import { useHasAiChatPageContentInset } from '@/ai-chat/hooks/useHasAiChatPageContentInset';
import { useDeleteQueuedMessage } from '@/ai-chat/composer/hooks/useDeleteQueuedMessage';
import { useIsCurrentAiChatThreadReadOnly } from '@/ai-chat/threads/hooks/useIsCurrentAiChatThreadReadOnly';
import { aiChatThreadFetchedMessagesFamilyState } from '@/ai-chat/states/server/aiChatThreadFetchedMessagesFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledQueueContainer = styled(StyledAiChatContentContainer)<{
  hasPageContentInset: boolean;
}>`
  padding: 0
    ${({ hasPageContentInset }) =>
      hasPageContentInset
        ? AI_CHAT_PAGE_CONTENT_INLINE_PADDING
        : themeCssVariables.spacing[4]};
`;

export const AiChatQueuedMessages = () => {
  const isReadOnly = useIsCurrentAiChatThreadReadOnly();
  const hasPageContentInset = useHasAiChatPageContentInset();
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const { threadId } = useAiChatInstanceOrThrow();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const aiChatThreadFetchedMessages = useAtomFamilyStateValue(
    aiChatThreadFetchedMessagesFamilyState,
    { threadId },
  );
  const aiChatQueuedMessages = aiChatThreadFetchedMessages.queuedMessages;
  const { deleteQueuedMessage } = useDeleteQueuedMessage({
    threadId,
  });

  if (!isDefined(threadId) || !isNonEmptyArray(aiChatQueuedMessages)) {
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
    <StyledQueueContainer hasPageContentInset={hasPageContentInset}>
      <AiChatQueuedMessageList
        messages={messages}
        onRemove={isReadOnly ? undefined : deleteQueuedMessage}
      />
    </StyledQueueContainer>
  );
};
