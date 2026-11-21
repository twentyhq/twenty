import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { useLingui } from '@lingui/react/macro';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useIsCurrentAiChatThreadReadOnly } from '@/ai-chat/threads/hooks/useIsCurrentAiChatThreadReadOnly';
import { useAiChatSentMessageHandOff } from '@/ai-chat/messages/hooks/useAiChatSentMessageHandOff';
import { aiChatThreadIsDirectMessageFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadIsDirectMessageFamilySelector';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { AGENT_MESSAGE_ROLE } from '@/ai-chat/messages/constants/AgentMessageRole';
import { AI_CHAT_GROUPED_MESSAGE_GAP } from '@/ai-chat/messages/constants/AiChatGroupedMessageGap';
import { AI_CHAT_MESSAGE_LIST_GAP } from '@/ai-chat/messages/constants/AiChatMessageListGap';
import { AI_CHAT_USER_MESSAGE_MAX_WIDTH } from '@/ai-chat/messages/constants/AiChatUserMessageMaxWidth';
import { getFieldFilesValueFromFilePart } from '@/chat/utils/getFieldFilesValueFromFilePart';

import { AiChatMessageAuthorHeader } from '@/ai-chat/messages/components/AiChatMessageAuthorHeader';
import { AiChatMessageReplyQuote } from '@/ai-chat/messages/components/AiChatMessageReplyQuote';
import { AiChatAssistantMessageRenderer } from '@/ai-chat/messages/components/AiChatAssistantMessageRenderer';
import { AiChatMessageReactions } from '@/ai-chat/messages/components/AiChatMessageReactions';
import { AiChatMessageActions } from '@/ai-chat/messages/components/AiChatMessageActions';
import { AiChatErrorRenderer } from '@/ai-chat/messages/components/AiChatErrorRenderer';
import { ChatMessageAttachments } from '@/chat/components/ChatMessageAttachments';
import { ChatMessageTime } from '@/chat/components/ChatMessageTime';
import { ChatMessageTimestamp } from '@/chat/components/ChatMessageTimestamp';
import { ChatMessageBubbleContent } from '@/chat/components/ChatMessageBubbleContent';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { StyledChatMessageBubble } from '@/chat/components/StyledChatMessageBubble';
import { StyledChatMessageFooter } from '@/chat/components/StyledChatMessageFooter';
import { StyledChatMessageRow } from '@/chat/components/StyledChatMessageRow';
import { AiChatUserMessageCollapsibleContent } from '@/ai-chat/messages/components/AiChatUserMessageCollapsibleContent';
import { aiChatFirstUnreadMessageIdFamilySelector } from '@/ai-chat/messages/states/selectors/aiChatFirstUnreadMessageIdFamilySelector';
import { aiChatIsMessageBeforeFirstUserMessageFamilySelector } from '@/ai-chat/messages/states/selectors/aiChatIsMessageBeforeFirstUserMessageFamilySelector';
import { aiChatMessageGroupPositionFamilySelector } from '@/ai-chat/messages/states/selectors/aiChatMessageGroupPositionFamilySelector';
import { aiChatMessageReactionsFamilyState } from '@/ai-chat/states/server/aiChatMessageReactionsFamilyState';
import { AI_CHAT_UNGROUPED_MESSAGE_POSITION } from '@/ai-chat/messages/constants/AiChatUngroupedMessagePosition';
import { aiChatThreadMessageFamilySelector } from '@/ai-chat/states/selectors/aiChatThreadMessageFamilySelector';
import { isAiChatMessageOwn } from '@/ai-chat/messages/utils/isAiChatMessageOwn';
import { parseAiChatMessageQuote } from '@/ai-chat/messages/utils/parseAiChatMessageQuote';
import { getAiChatSenderLabel } from '@/ai-chat/utils/getAiChatSenderLabel';
import { isSilentAiChatMessage } from '@/ai-chat/messages/utils/isSilentAiChatMessage';
import { getAiChatMessageWorkDurationMs } from '@/ai-chat/messages/utils/getAiChatMessageWorkDurationMs';
import { type AiChatError } from '@/ai-chat/types/AiChatError';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

import { isExtendedFileUIPart } from 'twenty-shared/ai';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { LabeledSeparator } from 'twenty-ui/components/layout';
import { themeCssVariables } from 'twenty-ui/theme';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

const StyledSender = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  margin-bottom: ${themeCssVariables.spacing[1]};
`;

const StyledMessageContainer = styled.div<{
  isUser?: boolean;
  isRightAligned: boolean;
}>`
  align-items: ${({ isRightAligned }) =>
    isRightAligned ? 'flex-end' : 'flex-start'};
  display: ${({ isUser }) => (isUser ? 'flex' : 'block')};
  flex-direction: column;
  max-width: ${({ isUser }) =>
    isUser ? `min(100%, ${AI_CHAT_USER_MESSAGE_MAX_WIDTH})` : '100%'};
  min-width: 0;
  width: ${({ isUser }) => (isUser ? 'fit-content' : '100%')};
`;

// The list spaces rows with one gap, so a grouped row gives back the difference
const StyledMessageRow = styled(StyledChatMessageRow)<{
  isTightlyGroupedWithNext: boolean;
}>`
  margin-bottom: ${({ isTightlyGroupedWithNext }) =>
    isTightlyGroupedWithNext
      ? `calc(${AI_CHAT_GROUPED_MESSAGE_GAP} - ${AI_CHAT_MESSAGE_LIST_GAP})`
      : '0'};
`;

const StyledMessageLine = styled.div<{ isRightAligned: boolean }>`
  align-items: flex-end;
  display: flex;
  flex-direction: ${({ isRightAligned }) =>
    isRightAligned ? 'row-reverse' : 'row'};
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
  width: 100%;
`;

type AiChatUserMessageTextProps = {
  messageId: string;
  children: ReactNode;
  isOtherMember: boolean;
  meta?: ReactNode;
};

const AiChatUserMessageText = ({
  messageId,
  children,
  isOtherMember,
  meta,
}: AiChatUserMessageTextProps) => {
  const sentMessageHandOffRef = useAiChatSentMessageHandOff(messageId);

  return (
    <StyledChatMessageBubble
      isUser
      isOtherMember={isOtherMember}
      ref={sentMessageHandOffRef}
    >
      <ChatMessageBubbleContent meta={meta} isSpacerReservedByContent>
        <AiChatUserMessageCollapsibleContent>
          {children}
        </AiChatUserMessageCollapsibleContent>
      </ChatMessageBubbleContent>
    </StyledChatMessageBubble>
  );
};

type AiChatMessageProps = {
  messageId: string;
  isLastMessageStreaming?: boolean;
  error?: AiChatError;
  onEdit?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
};

export const AiChatMessage = ({
  messageId,
  isLastMessageStreaming = false,
  error,
  onEdit,
  onDelete,
}: AiChatMessageProps) => {
  const { threadId } = useAiChatInstanceOrThrow();
  const { t } = useLingui();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const agentChatMessage = useAtomFamilySelectorValue(
    aiChatThreadMessageFamilySelector,
    { threadId, messageId },
  );

  const isMessageBeforeFirstUserMessage = useAtomFamilySelectorValue(
    aiChatIsMessageBeforeFirstUserMessageFamilySelector,
    { threadId, messageId },
  );

  const aiChatFirstUnreadMessageId = useAtomFamilySelectorValue(
    aiChatFirstUnreadMessageIdFamilySelector,
    threadId,
  );
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const isReadOnly = useIsCurrentAiChatThreadReadOnly();
  const isDirectMessage = useAtomFamilySelectorValue(
    aiChatThreadIsDirectMessageFamilySelector,
    threadId,
  );

  const aiChatMessageGroupPosition = useAtomFamilySelectorValue(
    aiChatMessageGroupPositionFamilySelector,
    { threadId, messageId },
  );
  const aiChatMessageReactions = useAtomFamilyStateValue(
    aiChatMessageReactionsFamilyState,
    { messageId },
  );

  if (
    !isDefined(agentChatMessage) ||
    (isSilentAiChatMessage(agentChatMessage) && !isDefined(error))
  ) {
    return null;
  }

  const senderId = agentChatMessage.metadata?.senderWorkspaceMemberId;
  const sender = currentWorkspaceMembers.find(
    (member) => isDefined(senderId) && member.id === senderId,
  );
  const isOwnMessage = isAiChatMessageOwn({
    message: agentChatMessage,
    currentWorkspaceMemberId: currentWorkspaceMember?.id,
    isSenderlessUserMessageOwn: !isAiChatInboxEnabled,
  });
  const isUser = agentChatMessage.role === AGENT_MESSAGE_ROLE.USER;
  const { isGroupedWithPrevious, isGroupedWithNext, isTimeSharedWithNext } =
    isAiChatInboxEnabled
      ? aiChatMessageGroupPosition
      : AI_CHAT_UNGROUPED_MESSAGE_POSITION;
  const canReply = isAiChatInboxEnabled && !isReadOnly;
  const isRightAligned = isAiChatInboxEnabled ? isOwnMessage : isUser;
  const canManageMessage = isUser && isOwnMessage && !isReadOnly;
  const shouldMirrorMessageActions = isAiChatInboxEnabled && isOwnMessage;
  const createdAt = agentChatMessage.metadata?.createdAt ?? new Date();
  const isOtherMemberMessage = isAiChatInboxEnabled && !isOwnMessage;
  const hasHeader = isOtherMemberMessage && !isGroupedWithPrevious;
  const hasTimeInBubble = isAiChatInboxEnabled && isOwnMessage && isUser;
  const hasVisibleTimeInBubble = hasTimeInBubble && !isTimeSharedWithNext;
  const hasFooterTimestamp = !isOtherMemberMessage && !hasTimeInBubble;
  const hasReactions =
    isAiChatInboxEnabled &&
    !isDirectMessage &&
    isNonEmptyArray(aiChatMessageReactions);
  const hasContent = isNonEmptyArray(agentChatMessage.parts);
  const hasSideActions = isAiChatInboxEnabled && isUser;
  const hasFooter = hasContent && (!hasSideActions || hasReactions);
  const isTightlyGroupedWithNext =
    isGroupedWithNext && !hasVisibleTimeInBubble && !hasFooter;
  const shouldShowError =
    isDefined(error) && agentChatMessage.role === AGENT_MESSAGE_ROLE.ASSISTANT;

  const attachments = agentChatMessage.parts
    .filter(isExtendedFileUIPart)
    .map(getFieldFilesValueFromFilePart);
  const messageText =
    agentChatMessage.parts.find((part) => part.type === 'text')?.text ?? '';
  const messageQuote =
    isAiChatInboxEnabled && isUser
      ? parseAiChatMessageQuote(messageText)
      : null;
  const messageParts = !isDefined(messageQuote)
    ? agentChatMessage.parts
    : agentChatMessage.parts.map((part) =>
        part.type === 'text' && part.text === messageText
          ? { ...part, text: messageQuote.replyText }
          : part,
      );
  const messageContent = (
    <AiChatAssistantMessageRenderer
      isUserMessage={isUser}
      isLastMessageStreaming={isLastMessageStreaming}
      messageParts={messageParts}
      hasError={shouldShowError}
      shouldHideThinkingSteps={isMessageBeforeFirstUserMessage}
      workDurationMs={getAiChatMessageWorkDurationMs({
        metadata: agentChatMessage.metadata,
        isStreaming: isLastMessageStreaming,
      })}
    />
  );

  const bubbleTime = hasVisibleTimeInBubble ? (
    <ChatMessageTime date={createdAt} />
  ) : undefined;

  const messageActions = (
    <AiChatMessageActions
      messageId={messageId}
      messageText={messageText}
      isRightAligned={shouldMirrorMessageActions}
      canReact={
        isAiChatInboxEnabled && !isDirectMessage && !isLastMessageStreaming
      }
      canReply={canReply}
      onEdit={canManageMessage ? onEdit : undefined}
      onDelete={canManageMessage ? onDelete : undefined}
    />
  );

  return (
    <>
      {isAiChatInboxEnabled && aiChatFirstUnreadMessageId === messageId && (
        <LabeledSeparator
          labelPosition="end"
          tone="danger"
          hasStartMarker
        >{t`New`}</LabeledSeparator>
      )}
      <StyledMessageRow
        isRightAligned={isRightAligned}
        isTightlyGroupedWithNext={isTightlyGroupedWithNext}
        data-agent-chat-message-id={messageId}
      >
        {hasHeader && (
          <AiChatMessageAuthorHeader
            messageId={messageId}
            role={agentChatMessage.role}
            metadata={agentChatMessage.metadata}
            createdAt={createdAt}
          />
        )}
        {!isAiChatInboxEnabled && isUser && isDefined(senderId) && (
          <StyledSender>
            {getAiChatSenderLabel({
              sender,
              isCurrentWorkspaceMember: isOwnMessage,
            })}
          </StyledSender>
        )}
        <StyledMessageLine isRightAligned={isRightAligned}>
          <StyledMessageContainer
            isUser={isUser}
            isRightAligned={isRightAligned}
          >
            {isDefined(messageQuote) && (
              <AiChatMessageReplyQuote
                replyMessageId={messageId}
                quote={messageQuote}
              />
            )}
            {isUser ? (
              <AiChatUserMessageText
                messageId={messageId}
                isOtherMember={isOtherMemberMessage}
                meta={bubbleTime}
              >
                {messageContent}
              </AiChatUserMessageText>
            ) : (
              <StyledChatMessageBubble>
                {messageContent}
              </StyledChatMessageBubble>
            )}
            {isNonEmptyArray(attachments) && (
              <ChatMessageAttachments
                files={attachments}
                isRightAligned={isRightAligned}
              />
            )}
            {shouldShowError && <AiChatErrorRenderer error={error} />}
          </StyledMessageContainer>
          {hasContent && hasSideActions && messageActions}
        </StyledMessageLine>
        {hasFooter && (
          <StyledChatMessageFooter
            isSpreadOut={!isAiChatInboxEnabled}
            isRightAligned={shouldMirrorMessageActions}
          >
            {isAiChatInboxEnabled && !isDirectMessage && (
              <AiChatMessageReactions messageId={messageId} />
            )}
            {hasFooterTimestamp && (
              <ChatMessageTimestamp createdAt={createdAt} />
            )}
            {!hasSideActions && messageActions}
          </StyledChatMessageFooter>
        )}
      </StyledMessageRow>
    </>
  );
};
