import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { isInboxMessageOwn } from '@/ai/utils/isInboxMessageOwn';
import { isAgentChatQueuedMessageRemovable } from '@/ai/utils/isAgentChatQueuedMessageRemovable';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { getInboxSenderLabel } from '@/ai/utils/getInboxSenderLabel';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';
import { AiChatQueuedMessageList } from '@/ai/components/AiChatQueuedMessageList';
import { StyledInboxContentContainer } from '@/ai/components/StyledInboxContentContainer';
import { INBOX_THREAD_PAGE_CONTENT_INLINE_PADDING } from '@/ai/constants/InboxThreadPageContentInlinePadding';
import { useHasInboxThreadPageContentInset } from '@/ai/hooks/useHasInboxThreadPageContentInset';
import { useDeleteQueuedMessage } from '@/ai/hooks/useDeleteQueuedMessage';
import { useIsCurrentInboxThreadReadOnly } from '@/ai/hooks/useIsCurrentInboxThreadReadOnly';
import { agentChatQueuedMessagesFamilyState } from '@/ai/states/agentChatQueuedMessagesFamilyState';
import { currentInboxThreadState } from '@/ai/states/currentInboxThreadState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledQueueContainer = styled(StyledInboxContentContainer)<{
  hasPageContentInset: boolean;
}>`
  padding: 0
    ${({ hasPageContentInset }) =>
      hasPageContentInset
        ? INBOX_THREAD_PAGE_CONTENT_INLINE_PADDING
        : themeCssVariables.spacing[4]};
`;

export const AiChatQueuedMessages = () => {
  const isReadOnly = useIsCurrentInboxThreadReadOnly();
  const hasPageContentInset = useHasInboxThreadPageContentInset();
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const currentInboxThread = useAtomStateValue(currentInboxThreadState);
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const agentChatQueuedMessages = useAtomFamilyStateValue(
    agentChatQueuedMessagesFamilyState,
    { threadId: currentInboxThread },
  );
  const { deleteQueuedMessage } = useDeleteQueuedMessage();

  if (
    !isDefined(currentInboxThread) ||
    !isNonEmptyArray(agentChatQueuedMessages)
  ) {
    return null;
  }

  const hasOtherSenders = agentChatQueuedMessages.some(
    (message) =>
      isDefined(message.metadata?.senderWorkspaceMemberId) &&
      !isInboxMessageOwn({
        message,
        currentWorkspaceMemberId: currentWorkspaceMember?.id,
        isSenderlessUserMessageOwn: !isAiChatInboxEnabled,
      }),
  );
  const messages = agentChatQueuedMessages.map((message) => {
    const senderId = message.metadata?.senderWorkspaceMemberId;
    const isCurrentWorkspaceMember = isInboxMessageOwn({
      message,
      currentWorkspaceMemberId: currentWorkspaceMember?.id,
      isSenderlessUserMessageOwn: !isAiChatInboxEnabled,
    });
    const queuedMessage = {
      id: message.id,
      text: message.parts.find((part) => part.type === 'text')?.text ?? '',
      isRemovable: isAgentChatQueuedMessageRemovable({
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
        name: getInboxSenderLabel({
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
