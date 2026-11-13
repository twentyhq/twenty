import { useLingui } from '@lingui/react/macro';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useIsCurrentInboxThreadReadOnly } from '@/ai/hooks/useIsCurrentAiChatThreadReadOnly';
import { useAiChatSentMessageHandOff } from '@/ai/hooks/useAiChatSentMessageHandOff';
import { inboxThreadIsDirectMessageFamilySelector } from '@/ai/states/selectors/agentChatThreadIsDirectMessageFamilySelector';
import { currentInboxThreadState } from '@/ai/states/currentAiChatThreadState';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { AGENT_MESSAGE_ROLE } from '@/ai/constants/AgentMessageRole';
import { shouldFocusChatEditorState } from '@/ai/states/shouldFocusChatEditorState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { inboxQuotedMessageIdFamilyState } from '@/ai/states/agentChatQuotedMessageIdFamilyState';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { INBOX_USER_MESSAGE_MAX_WIDTH } from '@/ai/constants/AiChatUserMessageMaxWidth';
import { getFieldFilesValueFromFilePart } from '@/chat/utils/getFieldFilesValueFromFilePart';

import { InboxMessageAuthorHeader } from '@/ai/components/AiChatMessageAuthorHeader';
import { InboxMessageReplyQuote } from '@/ai/components/AiChatMessageReplyQuote';
import { AiChatAssistantMessageRenderer } from '@/ai/components/AiChatAssistantMessageRenderer';
import { InboxMessageReactionPicker } from '@/ai/components/AiChatMessageReactionPicker';
import { InboxMessageReactions } from '@/ai/components/AiChatMessageReactions';
import { AiChatErrorRenderer } from '@/ai/components/AiChatErrorRenderer';
import { InboxMessageReceipt } from '@/ai/components/AiChatMessageReceipt';
import { inboxDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { inboxThreadReadPositionsFamilyState } from '@/ai/states/agentChatThreadReadPositionsFamilyState';
import { ChatMessageAttachments } from '@/chat/components/ChatMessageAttachments';
import { ChatMessageTime } from '@/chat/components/ChatMessageTime';
import { ChatMessageTimestamp } from '@/chat/components/ChatMessageTimestamp';
import { StyledChatMessageBubbleContent } from '@/chat/components/StyledChatMessageBubbleContent';
import { StyledChatMessageMeta } from '@/chat/components/StyledChatMessageMeta';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { StyledChatMessageActions } from '@/chat/components/StyledChatMessageActions';
import { StyledChatMessageBubble } from '@/chat/components/StyledChatMessageBubble';
import { StyledChatMessageFooter } from '@/chat/components/StyledChatMessageFooter';
import { StyledChatMessageRow } from '@/chat/components/StyledChatMessageRow';
import { InboxUserMessageCollapsibleContent } from '@/ai/components/AiChatUserMessageCollapsibleContent';
import { inboxFirstUnreadMessageIdSelector } from '@/ai/states/selectors/agentChatFirstUnreadMessageIdSelector';
import { inboxIsMessageBeforeFirstUserMessageFamilySelector } from '@/ai/states/selectors/agentChatIsMessageBeforeFirstUserMessageFamilySelector';
import { inboxMessageFamilySelector } from '@/ai/states/selectors/agentChatMessageFamilySelector';
import { isInboxMessageOwn } from '@/ai/utils/isAgentChatMessageOwn';
import { parseInboxMessageQuote } from '@/ai/utils/parseAgentChatMessageQuote';
import { getInboxSenderLabel } from '@/ai/utils/getAgentChatSenderLabel';
import { isSilentInboxMessage } from '@/ai/utils/isSilentAgentChatMessage';
import { getInboxMessageWorkDurationMs } from '@/ai/utils/getAgentChatMessageWorkDurationMs';
import { type AiChatError } from '@/ai/types/AiChatError';
import { LightCopyIconButton } from '@/ui/input/components/LightCopyIconButton';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

import { isExtendedFileUIPart } from 'twenty-shared/ai';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconArrowBackUp, IconEdit, IconTrash } from 'twenty-ui/icon';
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
    isUser ? `min(100%, ${INBOX_USER_MESSAGE_MAX_WIDTH})` : '100%'};
  min-width: 0;
  width: ${({ isUser }) => (isUser ? 'fit-content' : '100%')};
`;

const StyledUserMessageContent = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

type InboxUserMessageTextProps = {
  messageId: string;
  children: ReactNode;
  isOtherMember: boolean;
  meta?: ReactNode;
};

const InboxUserMessageText = ({
  messageId,
  children,
  isOtherMember,
  meta,
}: InboxUserMessageTextProps) => {
  const sentMessageHandOffRef = useAiChatSentMessageHandOff(messageId);
  const content = (
    <InboxUserMessageCollapsibleContent>
      {children}
    </InboxUserMessageCollapsibleContent>
  );

  return (
    <StyledChatMessageBubble
      isUser
      isOtherMember={isOtherMember}
      ref={sentMessageHandOffRef}
    >
      {isDefined(meta) ? (
        <StyledChatMessageBubbleContent>
          <StyledUserMessageContent>{content}</StyledUserMessageContent>
          {meta}
        </StyledChatMessageBubbleContent>
      ) : (
        content
      )}
    </StyledChatMessageBubble>
  );
};

type InboxMessageProps = {
  messageId: string;
  isLastMessageStreaming?: boolean;
  error?: AiChatError;
  onEdit?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
};

export const InboxMessage = ({
  messageId,
  isLastMessageStreaming = false,
  error,
  onEdit,
  onDelete,
}: InboxMessageProps) => {
  const { t } = useLingui();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const agentChatMessage = useAtomFamilySelectorValue(
    inboxMessageFamilySelector,
    { messageId },
  );

  const isMessageBeforeFirstUserMessage = useAtomFamilySelectorValue(
    inboxIsMessageBeforeFirstUserMessageFamilySelector,
    { messageId },
  );

  const inboxFirstUnreadMessageId = useAtomStateValue(
    inboxFirstUnreadMessageIdSelector,
  );
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const currentInboxThread = useAtomStateValue(currentInboxThreadState);
  const inboxDisplayedThread = useAtomStateValue(inboxDisplayedThreadState);
  const inboxThreadReadPositions = useAtomFamilyStateValue(
    inboxThreadReadPositionsFamilyState,
    { threadId: inboxDisplayedThread },
  );
  const isReadOnly = useIsCurrentInboxThreadReadOnly();
  const isDirectMessage = useAtomFamilySelectorValue(
    inboxThreadIsDirectMessageFamilySelector,
    currentInboxThread,
  );

  const setInboxQuotedMessageId = useSetAtomFamilyState(
    inboxQuotedMessageIdFamilyState,
    { threadId: currentInboxThread },
  );

  const setShouldFocusChatEditor = useSetAtomState(shouldFocusChatEditorState);

  if (
    !isDefined(agentChatMessage) ||
    (isSilentInboxMessage(agentChatMessage) && !isDefined(error))
  ) {
    return null;
  }

  const senderId = agentChatMessage.metadata?.senderWorkspaceMemberId;
  const sender = currentWorkspaceMembers.find(
    (member) => isDefined(senderId) && member.id === senderId,
  );
  const isOwnMessage = isInboxMessageOwn({
    message: agentChatMessage,
    currentWorkspaceMemberId: currentWorkspaceMember?.id,
    isSenderlessUserMessageOwn: !isAiChatInboxEnabled,
  });
  const isUser = agentChatMessage.role === AGENT_MESSAGE_ROLE.USER;
  const canReply = isAiChatInboxEnabled && !isReadOnly;
  const isRightAligned = isAiChatInboxEnabled ? isOwnMessage : isUser;
  const canManageMessage = isUser && isOwnMessage && !isReadOnly;
  const shouldMirrorMessageActions = isAiChatInboxEnabled && isOwnMessage;
  const createdAt = agentChatMessage.metadata?.createdAt ?? new Date();
  const hasHeader = isAiChatInboxEnabled && !isOwnMessage;
  const hasOwnReceipt =
    isAiChatInboxEnabled &&
    isOwnMessage &&
    isUser &&
    isDefined(inboxThreadReadPositions);
  const shouldShowError =
    isDefined(error) && agentChatMessage.role === AGENT_MESSAGE_ROLE.ASSISTANT;

  const attachments = agentChatMessage.parts
    .filter(isExtendedFileUIPart)
    .map(getFieldFilesValueFromFilePart);
  const messageText =
    agentChatMessage.parts.find((part) => part.type === 'text')?.text ?? '';
  const messageQuote =
    isAiChatInboxEnabled && isUser ? parseInboxMessageQuote(messageText) : null;
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
      workDurationMs={getInboxMessageWorkDurationMs({
        metadata: agentChatMessage.metadata,
        isStreaming: isLastMessageStreaming,
      })}
    />
  );

  return (
    <>
      {isAiChatInboxEnabled && inboxFirstUnreadMessageId === messageId && (
        <LabeledSeparator
          labelPosition="end"
          tone="danger"
          hasStartMarker
        >{t`New`}</LabeledSeparator>
      )}
      <StyledChatMessageRow
        isRightAligned={isRightAligned}
        data-agent-chat-message-id={messageId}
      >
        {hasHeader && (
          <InboxMessageAuthorHeader
            messageId={messageId}
            role={agentChatMessage.role}
            metadata={agentChatMessage.metadata}
            createdAt={createdAt}
          />
        )}
        {!isAiChatInboxEnabled && isUser && isDefined(senderId) && (
          <StyledSender>
            {getInboxSenderLabel({
              sender,
              isCurrentWorkspaceMember: isOwnMessage,
            })}
          </StyledSender>
        )}
        <StyledMessageContainer isUser={isUser} isRightAligned={isRightAligned}>
          {isDefined(messageQuote) && (
            <InboxMessageReplyQuote
              replyMessageId={messageId}
              quote={messageQuote}
            />
          )}
          {isUser ? (
            <InboxUserMessageText
              messageId={messageId}
              isOtherMember={isAiChatInboxEnabled && !isOwnMessage}
              meta={
                hasOwnReceipt ? (
                  <StyledChatMessageMeta>
                    <ChatMessageTime date={createdAt} />
                    <InboxMessageReceipt messageId={messageId} />
                  </StyledChatMessageMeta>
                ) : undefined
              }
            >
              {messageContent}
            </InboxUserMessageText>
          ) : (
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
        {isNonEmptyArray(agentChatMessage.parts) && (
          <StyledChatMessageFooter
            isSpreadOut={!isAiChatInboxEnabled}
            isRightAligned={shouldMirrorMessageActions}
          >
            {isAiChatInboxEnabled && !isDirectMessage && (
              <InboxMessageReactions messageId={messageId} />
            )}
            {!hasHeader && !hasOwnReceipt && (
              <ChatMessageTimestamp createdAt={createdAt} />
            )}
            <StyledChatMessageActions
              className="message-actions"
              isRightAligned={shouldMirrorMessageActions}
            >
              {isAiChatInboxEnabled &&
                !isDirectMessage &&
                !isLastMessageStreaming && (
                  <InboxMessageReactionPicker messageId={messageId} />
                )}
              {canReply && (
                <LightIconButton
                  aria-label={t`Reply`}
                  onClick={() => {
                    setInboxQuotedMessageId(messageId);
                    setShouldFocusChatEditor(true);
                  }}
                >
                  <IconArrowBackUp />
                </LightIconButton>
              )}
              <LightCopyIconButton copyText={messageText} />
              {canManageMessage && isDefined(onEdit) && (
                <LightIconButton
                  aria-label={t`Edit message`}
                  tooltip={t`Edit message`}
                  onClick={() => onEdit(messageId)}
                >
                  <IconEdit />
                </LightIconButton>
              )}
              {canManageMessage && isDefined(onDelete) && (
                <LightIconButton
                  aria-label={t`Delete message`}
                  tooltip={t`Delete message`}
                  onClick={() => onDelete(messageId)}
                >
                  <IconTrash />
                </LightIconButton>
              )}
            </StyledChatMessageActions>
          </StyledChatMessageFooter>
        )}
      </StyledChatMessageRow>
    </>
  );
};
