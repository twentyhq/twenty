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
import { aiChatComposerShouldFocusFamilyState } from '@/ai-chat/states/composer/aiChatComposerShouldFocusFamilyState';
import { aiChatComposerQuotedMessageIdFamilyState } from '@/ai-chat/states/composer/aiChatComposerQuotedMessageIdFamilyState';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { AI_CHAT_USER_MESSAGE_MAX_WIDTH } from '@/ai-chat/messages/constants/AiChatUserMessageMaxWidth';
import { getFieldFilesValueFromFilePart } from '@/chat/utils/getFieldFilesValueFromFilePart';

import { AiChatMessageAuthorHeader } from '@/ai-chat/messages/components/AiChatMessageAuthorHeader';
import { AiChatMessageReplyQuote } from '@/ai-chat/messages/components/AiChatMessageReplyQuote';
import { AiChatAssistantMessageRenderer } from '@/ai-chat/messages/components/AiChatAssistantMessageRenderer';
import { AiChatMessageReactionPicker } from '@/ai-chat/messages/components/AiChatMessageReactionPicker';
import { AiChatMessageReactions } from '@/ai-chat/messages/components/AiChatMessageReactions';
import { AiChatErrorRenderer } from '@/ai-chat/messages/components/AiChatErrorRenderer';
import { ChatMessageAttachments } from '@/chat/components/ChatMessageAttachments';
import { ChatMessageTimestamp } from '@/chat/components/ChatMessageTimestamp';
import { StyledChatMessageActions } from '@/chat/components/StyledChatMessageActions';
import { StyledChatMessageBubble } from '@/chat/components/StyledChatMessageBubble';
import { StyledChatMessageFooter } from '@/chat/components/StyledChatMessageFooter';
import { StyledChatMessageRow } from '@/chat/components/StyledChatMessageRow';
import { AiChatUserMessageCollapsibleContent } from '@/ai-chat/messages/components/AiChatUserMessageCollapsibleContent';
import { aiChatFirstUnreadMessageIdFamilySelector } from '@/ai-chat/messages/states/selectors/aiChatFirstUnreadMessageIdFamilySelector';
import { aiChatIsMessageBeforeFirstUserMessageFamilySelector } from '@/ai-chat/messages/states/selectors/aiChatIsMessageBeforeFirstUserMessageFamilySelector';
import { aiChatThreadMessageFamilySelector } from '@/ai-chat/states/selectors/aiChatThreadMessageFamilySelector';
import { isAiChatMessageOwn } from '@/ai-chat/messages/utils/isAiChatMessageOwn';
import { parseAiChatMessageQuote } from '@/ai-chat/messages/utils/parseAiChatMessageQuote';
import { getAiChatSenderLabel } from '@/ai-chat/utils/getAiChatSenderLabel';
import { isSilentAiChatMessage } from '@/ai-chat/messages/utils/isSilentAiChatMessage';
import { getAiChatMessageWorkDurationMs } from '@/ai-chat/messages/utils/getAiChatMessageWorkDurationMs';
import { type AiChatError } from '@/ai-chat/types/AiChatError';
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
    isUser ? `min(100%, ${AI_CHAT_USER_MESSAGE_MAX_WIDTH})` : '100%'};
  min-width: 0;
  width: ${({ isUser }) => (isUser ? 'fit-content' : '100%')};
`;

type AiChatUserMessageTextProps = {
  messageId: string;
  children: ReactNode;
  isOtherMember: boolean;
};

const AiChatUserMessageText = ({
  messageId,
  children,
  isOtherMember,
}: AiChatUserMessageTextProps) => {
  const sentMessageHandOffRef = useAiChatSentMessageHandOff(messageId);

  return (
    <StyledChatMessageBubble
      isUser
      isOtherMember={isOtherMember}
      ref={sentMessageHandOffRef}
    >
      <AiChatUserMessageCollapsibleContent>
        {children}
      </AiChatUserMessageCollapsibleContent>
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

  const setAiChatComposerQuotedMessageId = useSetAtomFamilyState(
    aiChatComposerQuotedMessageIdFamilyState,
    { threadId },
  );

  const setAiChatComposerShouldFocus = useSetAtomFamilyState(
    aiChatComposerShouldFocusFamilyState,
    { threadId },
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
  const canReply = isAiChatInboxEnabled && !isReadOnly;
  const isRightAligned = isAiChatInboxEnabled ? isOwnMessage : isUser;
  const canManageMessage = isUser && isOwnMessage && !isReadOnly;
  const shouldMirrorMessageActions = isAiChatInboxEnabled && isOwnMessage;
  const createdAt = agentChatMessage.metadata?.createdAt ?? new Date();
  const hasHeader = isAiChatInboxEnabled && !isOwnMessage;
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

  return (
    <>
      {isAiChatInboxEnabled && aiChatFirstUnreadMessageId === messageId && (
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
        <StyledMessageContainer isUser={isUser} isRightAligned={isRightAligned}>
          {isDefined(messageQuote) && (
            <AiChatMessageReplyQuote
              replyMessageId={messageId}
              quote={messageQuote}
            />
          )}
          {isUser ? (
            <AiChatUserMessageText
              messageId={messageId}
              isOtherMember={isAiChatInboxEnabled && !isOwnMessage}
            >
              {messageContent}
            </AiChatUserMessageText>
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
              <AiChatMessageReactions messageId={messageId} />
            )}
            {!hasHeader && <ChatMessageTimestamp createdAt={createdAt} />}
            <StyledChatMessageActions
              className="message-actions"
              isRightAligned={shouldMirrorMessageActions}
            >
              {isAiChatInboxEnabled &&
                !isDirectMessage &&
                !isLastMessageStreaming && (
                  <AiChatMessageReactionPicker messageId={messageId} />
                )}
              {canReply && (
                <LightIconButton
                  aria-label={t`Reply`}
                  onClick={() => {
                    setAiChatComposerQuotedMessageId(messageId);
                    setAiChatComposerShouldFocus(true);
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
