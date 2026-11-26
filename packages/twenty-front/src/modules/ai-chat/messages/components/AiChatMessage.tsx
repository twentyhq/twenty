import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { useLingui } from '@lingui/react/macro';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useIsCurrentAiChatThreadReadOnly } from '@/ai-chat/threads/hooks/useIsCurrentAiChatThreadReadOnly';
import { useAiChatSentMessageHandOff } from '@/ai-chat/messages/hooks/useAiChatSentMessageHandOff';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { AGENT_MESSAGE_ROLE } from '@/ai-chat/messages/constants/AgentMessageRole';
import { CHAT_GROUPED_MESSAGE_GAP } from '@/chat/constants/ChatGroupedMessageGap';
import { CHAT_MESSAGE_LIST_GAP } from '@/chat/constants/ChatMessageListGap';
import { CHAT_RUN_GAP } from '@/chat/constants/ChatRunGap';
import { AI_CHAT_USER_MESSAGE_MAX_WIDTH } from '@/ai-chat/messages/constants/AiChatUserMessageMaxWidth';
import { getFieldFilesValueFromFilePart } from '@/chat/utils/getFieldFilesValueFromFilePart';

import { ChatMessageDaySeparator } from '@/chat/components/ChatMessageDaySeparator';
import { AiChatMessageAuthorHeader } from '@/ai-chat/messages/components/AiChatMessageAuthorHeader';
import { AiChatToolsOnlyTurn } from '@/ai-chat/messages/components/AiChatToolsOnlyTurn';
import { useHasAiChatMessageFinishedStreamingInView } from '@/ai-chat/messages/hooks/useHasAiChatMessageFinishedStreamingInView';
import { useIsToolsOnlyAiChatMessage } from '@/ai-chat/messages/hooks/useIsToolsOnlyAiChatMessage';
import { AiChatMessageReplyQuote } from '@/ai-chat/messages/components/AiChatMessageReplyQuote';
import { AiChatMessagePartsRenderer } from '@/ai-chat/messages/components/AiChatMessagePartsRenderer';
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
import { getAiChatMessageText } from '@/ai-chat/messages/utils/getAiChatMessageText';
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
import { useIsTouchDevice } from 'twenty-ui/utilities';
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

const StyledMessageRow = styled(StyledChatMessageRow)<{
  isTightlyGroupedWithNext: boolean;
  isLastOfRun: boolean;
}>`
  margin-bottom: ${({ isTightlyGroupedWithNext, isLastOfRun }) => {
    if (isTightlyGroupedWithNext) {
      return `calc(${CHAT_GROUPED_MESSAGE_GAP} - ${CHAT_MESSAGE_LIST_GAP})`;
    }

    if (isLastOfRun) {
      return `calc(${CHAT_RUN_GAP} - ${CHAT_MESSAGE_LIST_GAP})`;
    }

    return '0';
  }};

  &:last-child {
    margin-bottom: 0;
  }
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
  const aiChatMessage = useAtomFamilySelectorValue(
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
  const isTouchDevice = useIsTouchDevice();

  const aiChatMessageGroupPosition = useAtomFamilySelectorValue(
    aiChatMessageGroupPositionFamilySelector,
    { threadId, messageId },
  );
  const aiChatMessageReactions = useAtomFamilyStateValue(
    aiChatMessageReactionsFamilyState,
    { messageId },
  );
  const isToolsOnlyMessage = useIsToolsOnlyAiChatMessage(aiChatMessage);
  const hasFinishedStreamingInView = useHasAiChatMessageFinishedStreamingInView(
    {
      messageId,
      isStreaming: isLastMessageStreaming,
    },
  );

  if (
    !isDefined(aiChatMessage) ||
    (isSilentAiChatMessage(aiChatMessage) && !isDefined(error))
  ) {
    return null;
  }

  const senderId = aiChatMessage.metadata?.senderWorkspaceMemberId;
  const sender = currentWorkspaceMembers.find(
    (member) => isDefined(senderId) && member.id === senderId,
  );
  const isOwnMessage = isAiChatMessageOwn({
    message: aiChatMessage,
    currentWorkspaceMemberId: currentWorkspaceMember?.id,
    isSenderlessUserMessageOwn: !isAiChatInboxEnabled,
  });
  const isUser = aiChatMessage.role === AGENT_MESSAGE_ROLE.USER;
  const {
    isGroupedWithPrevious,
    isGroupedWithNext,
    isTimeSharedWithNext,
    isFirstOfDay,
    isFollowedByNewDay,
  } = isAiChatInboxEnabled
    ? aiChatMessageGroupPosition
    : AI_CHAT_UNGROUPED_MESSAGE_POSITION;
  const canReply = isAiChatInboxEnabled && !isReadOnly;
  const isRightAligned = isAiChatInboxEnabled ? isOwnMessage : isUser;
  const canManageMessage = isUser && isOwnMessage && !isReadOnly;
  const shouldMirrorMessageActions = isAiChatInboxEnabled && isOwnMessage;
  const createdAt = aiChatMessage.metadata?.createdAt ?? new Date();
  const isOtherMemberMessage = isAiChatInboxEnabled && !isOwnMessage;
  const hasHeader = isOtherMemberMessage && !isGroupedWithPrevious;
  const hasTimeInBubble = isAiChatInboxEnabled && isUser;
  const hasVisibleTimeInBubble = hasTimeInBubble && !isTimeSharedWithNext;
  const hasFooterTimestamp = !isOtherMemberMessage && !hasTimeInBubble;
  const hasReactions =
    isAiChatInboxEnabled && isNonEmptyArray(aiChatMessageReactions);
  const hasContent = isNonEmptyArray(aiChatMessage.parts);
  const hasFloatingActions = isAiChatInboxEnabled && hasContent;
  const hasDaySeparator = isAiChatInboxEnabled && isFirstOfDay;
  const isFirstUnread =
    isAiChatInboxEnabled && aiChatFirstUnreadMessageId === messageId;
  const hasFooter =
    hasContent && (!isAiChatInboxEnabled || hasReactions || hasFooterTimestamp);
  const isTightlyGroupedWithNext =
    isGroupedWithNext && !hasVisibleTimeInBubble && !hasFooter;
  const shouldShowError =
    isDefined(error) && aiChatMessage.role === AGENT_MESSAGE_ROLE.ASSISTANT;
  const isToolsOnlyTurn =
    isAiChatInboxEnabled &&
    !isLastMessageStreaming &&
    !shouldShowError &&
    isToolsOnlyMessage;

  const attachments = aiChatMessage.parts
    .filter(isExtendedFileUIPart)
    .map(getFieldFilesValueFromFilePart);
  const messageText = getAiChatMessageText(aiChatMessage);
  const messageQuote =
    isAiChatInboxEnabled && isUser
      ? parseAiChatMessageQuote(messageText)
      : null;
  const messageParts = !isDefined(messageQuote)
    ? aiChatMessage.parts
    : aiChatMessage.parts.map((part) =>
        part.type === 'text' && part.text === messageText
          ? { ...part, text: messageQuote.replyText }
          : part,
      );
  const messageContent = (
    <AiChatMessagePartsRenderer
      isUserMessage={isUser}
      isLastMessageStreaming={isLastMessageStreaming}
      messageParts={messageParts}
      hasError={shouldShowError}
      shouldHideThinkingSteps={isMessageBeforeFirstUserMessage}
      workDurationMs={getAiChatMessageWorkDurationMs({
        metadata: aiChatMessage.metadata,
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
      isFloating={hasFloatingActions}
      canReact={isAiChatInboxEnabled && !isLastMessageStreaming}
      canReply={canReply}
      onEdit={canManageMessage ? onEdit : undefined}
      onDelete={canManageMessage ? onDelete : undefined}
    />
  );

  return (
    <>
      {hasDaySeparator && (
        <ChatMessageDaySeparator
          date={createdAt}
          isFirstUnread={isFirstUnread}
        />
      )}
      {isFirstUnread && !hasDaySeparator && (
        <LabeledSeparator
          labelPosition="end"
          tone="danger"
          hasStartMarker
        >{t`New`}</LabeledSeparator>
      )}
      <StyledMessageRow
        isRightAligned={isRightAligned}
        isTightlyGroupedWithNext={isTightlyGroupedWithNext}
        isLastOfRun={
          isAiChatInboxEnabled && !isGroupedWithNext && !isFollowedByNewDay
        }
        isGroupedWithPrevious={isGroupedWithPrevious}
        isGroupedWithNext={isGroupedWithNext}
        data-hover-card={hasFloatingActions ? '' : undefined}
        tabIndex={hasFloatingActions && isTouchDevice ? -1 : undefined}
        data-agent-chat-message-id={messageId}
      >
        {hasHeader && !isToolsOnlyTurn && (
          <AiChatMessageAuthorHeader
            messageId={messageId}
            role={aiChatMessage.role}
            metadata={aiChatMessage.metadata}
            createdAt={hasTimeInBubble ? undefined : createdAt}
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
        <StyledMessageContainer isUser={isUser} isRightAligned={isRightAligned}>
          {isDefined(messageQuote) && (
            <AiChatMessageReplyQuote
              replyMessageId={messageId}
              quote={messageQuote}
            />
          )}
          {isToolsOnlyTurn && (
            <AiChatToolsOnlyTurn
              message={aiChatMessage}
              hasTrailingSpace={hasFinishedStreamingInView}
            >
              {messageContent}
            </AiChatToolsOnlyTurn>
          )}
          {!isToolsOnlyTurn && isUser && (
            <AiChatUserMessageText
              messageId={messageId}
              isOtherMember={isOtherMemberMessage}
              meta={bubbleTime}
            >
              {messageContent}
            </AiChatUserMessageText>
          )}
          {!isToolsOnlyTurn && !isUser && (
            <StyledChatMessageBubble>{messageContent}</StyledChatMessageBubble>
          )}
          {isNonEmptyArray(attachments) && (
            <ChatMessageAttachments
              files={attachments}
              isRightAligned={isRightAligned}
            />
          )}
          {shouldShowError && <AiChatErrorRenderer error={error} />}
        </StyledMessageContainer>
        {hasFooter && (
          <StyledChatMessageFooter
            isCompact={isAiChatInboxEnabled}
            isSpreadOut={!isAiChatInboxEnabled}
            isRightAligned={shouldMirrorMessageActions}
          >
            {isAiChatInboxEnabled && (
              <AiChatMessageReactions messageId={messageId} />
            )}
            {hasFooterTimestamp && (
              <ChatMessageTimestamp createdAt={createdAt} />
            )}
            {!hasFloatingActions && messageActions}
          </StyledChatMessageFooter>
        )}
        {hasFloatingActions && messageActions}
      </StyledMessageRow>
    </>
  );
};
