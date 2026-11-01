import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { isAgentChatMessageOwn } from '@/ai/utils/isAgentChatMessageOwn';
import { isAgentChatQueuedMessageRemovable } from '@/ai/utils/isAgentChatQueuedMessageRemovable';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { getAgentChatSenderLabel } from '@/ai/utils/getAgentChatSenderLabel';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';
import { AiChatQueuedMessageList } from '@/ai/components/AiChatQueuedMessageList';
import { StyledAiChatContentContainer } from '@/ai/components/StyledAiChatContentContainer';
import { useDeleteQueuedMessage } from '@/ai/hooks/useDeleteQueuedMessage';
import { useIsCurrentAiChatThreadReadOnly } from '@/ai/hooks/useIsCurrentAiChatThreadReadOnly';
import { agentChatQueuedMessagesFamilyState } from '@/ai/states/agentChatQueuedMessagesFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledQueueContainer = styled(StyledAiChatContentContainer)`
  padding: 0 ${themeCssVariables.spacing[3]};
`;

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
  const agentChatQueuedMessages = useAtomFamilyStateValue(
    agentChatQueuedMessagesFamilyState,
    { threadId: currentAiChatThread },
  );
  const { deleteQueuedMessage } = useDeleteQueuedMessage();

  if (
    !isDefined(currentAiChatThread) ||
    !isNonEmptyArray(agentChatQueuedMessages)
  ) {
    return null;
  }

  const hasOtherSenders = agentChatQueuedMessages.some(
    (message) =>
      isDefined(message.metadata?.senderWorkspaceMemberId) &&
      !isAgentChatMessageOwn({
        message,
        currentWorkspaceMemberId: currentWorkspaceMember?.id,
        isSenderlessUserMessageOwn: !isAiChatInboxEnabled,
      }),
  );
  const messages = agentChatQueuedMessages.map((message) => {
    const senderId = message.metadata?.senderWorkspaceMemberId;
    const isCurrentWorkspaceMember = isAgentChatMessageOwn({
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
        name: getAgentChatSenderLabel({
          sender,
          isCurrentWorkspaceMember,
        }),
        avatarUrl: getAbsoluteImageUrl(sender?.avatarUrl),
      },
    };
  });

  return (
    <StyledQueueContainer>
      <AiChatQueuedMessageList
        messages={messages}
        onRemove={isReadOnly ? undefined : deleteQueuedMessage}
      />
    </StyledQueueContainer>
  );
};
