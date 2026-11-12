import { useLingui } from '@lingui/react/macro';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useIsCurrentAiChatThreadReadOnly } from '@/ai/hooks/useIsCurrentAiChatThreadReadOnly';
import { useAiChatSentMessageHandOff } from '@/ai/hooks/useAiChatSentMessageHandOff';
import { agentChatThreadIsDirectMessageFamilySelector } from '@/ai/states/selectors/agentChatThreadIsDirectMessageFamilySelector';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { AgentChatFilePreview } from '@/ai/components/internal/AgentChatFilePreview';
import { AGENT_MESSAGE_ROLE } from '@/ai/constants/AgentMessageRole';
import { shouldFocusChatEditorState } from '@/ai/states/shouldFocusChatEditorState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { agentChatQuotedMessageIdFamilyState } from '@/ai/states/agentChatQuotedMessageIdFamilyState';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { AI_CHAT_USER_MESSAGE_MAX_WIDTH } from '@/ai/constants/AiChatUserMessageMaxWidth';

import { AiChatMessageAuthorHeader } from '@/ai/components/AiChatMessageAuthorHeader';
import { AiChatMessageReplyQuote } from '@/ai/components/AiChatMessageReplyQuote';
import { AiChatAssistantMessageRenderer } from '@/ai/components/AiChatAssistantMessageRenderer';
import { AiChatMessageReactionPicker } from '@/ai/components/AiChatMessageReactionPicker';
import { AiChatMessageReactions } from '@/ai/components/AiChatMessageReactions';
import { AiChatErrorRenderer } from '@/ai/components/AiChatErrorRenderer';
import { ChatMessageTimestamp } from '@/chat/components/ChatMessageTimestamp';
import { StyledChatMessageActions } from '@/chat/components/StyledChatMessageActions';
import { StyledChatMessageBubble } from '@/chat/components/StyledChatMessageBubble';
import { StyledChatMessageFooter } from '@/chat/components/StyledChatMessageFooter';
import { StyledChatMessageRow } from '@/chat/components/StyledChatMessageRow';
import { AiChatUserMessageCollapsibleContent } from '@/ai/components/AiChatUserMessageCollapsibleContent';
import { agentChatFirstUnreadMessageIdSelector } from '@/ai/states/selectors/agentChatFirstUnreadMessageIdSelector';
import { agentChatIsMessageBeforeFirstUserMessageFamilySelector } from '@/ai/states/selectors/agentChatIsMessageBeforeFirstUserMessageFamilySelector';
import { agentChatMessageFamilySelector } from '@/ai/states/selectors/agentChatMessageFamilySelector';
import { isAgentChatMessageOwn } from '@/ai/utils/isAgentChatMessageOwn';
import { parseAgentChatMessageQuote } from '@/ai/utils/parseAgentChatMessageQuote';
import { type AgentChatMessageQuote } from '@/ai/types/AgentChatMessageQuote';
import { getAgentChatSenderLabel } from '@/ai/utils/getAgentChatSenderLabel';
import { isSilentAgentChatMessage } from '@/ai/utils/isSilentAgentChatMessage';
import { getAgentChatMessageWorkDurationMs } from '@/ai/utils/getAgentChatMessageWorkDurationMs';
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

const StyledMessageContainer = styled.div<{ isUser?: boolean }>`
  max-width: ${({ isUser }) =>
    isUser ? `min(100%, ${AI_CHAT_USER_MESSAGE_MAX_WIDTH})` : '100%'};
  min-width: 0;
  width: ${({ isUser }) => (isUser ? 'fit-content' : '100%')};
`;

const StyledFilesContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[2]};
`;

type AiChatUserMessageTextProps = {
  messageId: string;
  text: string;
  quote: AgentChatMessageQuote | null;
  children: ReactNode;
  isOtherMember: boolean;
};

const AiChatUserMessageText = ({
  messageId,
  text,
  quote,
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
      {isDefined(quote) && (
        <AiChatMessageReplyQuote replyMessageId={messageId} quote={quote} />
      )}
      <AiChatUserMessageCollapsibleContent text={quote?.replyText ?? text}>
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
  const { t } = useLingui();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const agentChatMessage = useAtomFamilySelectorValue(
    agentChatMessageFamilySelector,
    { messageId },
  );

  const isMessageBeforeFirstUserMessage = useAtomFamilySelectorValue(
    agentChatIsMessageBeforeFirstUserMessageFamilySelector,
    { messageId },
  );

  const agentChatFirstUnreadMessageId = useAtomStateValue(
    agentChatFirstUnreadMessageIdSelector,
  );
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const isReadOnly = useIsCurrentAiChatThreadReadOnly();
  const isDirectMessage = useAtomFamilySelectorValue(
    agentChatThreadIsDirectMessageFamilySelector,
    currentAiChatThread,
  );

  const setAgentChatQuotedMessageId = useSetAtomFamilyState(
    agentChatQuotedMessageIdFamilyState,
    { threadId: currentAiChatThread },
  );

  const setShouldFocusChatEditor = useSetAtomState(shouldFocusChatEditorState);

  if (
    !isDefined(agentChatMessage) ||
    (isSilentAgentChatMessage(agentChatMessage) && !isDefined(error))
  ) {
    return null;
  }

  const senderId = agentChatMessage.metadata?.senderWorkspaceMemberId;
  const sender = currentWorkspaceMembers.find(
    (member) => isDefined(senderId) && member.id === senderId,
  );
  const isOwnMessage = isAgentChatMessageOwn({
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

  const fileParts = agentChatMessage.parts.filter(isExtendedFileUIPart);
  const messageText =
    agentChatMessage.parts.find((part) => part.type === 'text')?.text ?? '';
  const messageQuote =
    isAiChatInboxEnabled && isUser
      ? parseAgentChatMessageQuote(messageText)
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
      workDurationMs={getAgentChatMessageWorkDurationMs({
        metadata: agentChatMessage.metadata,
        isStreaming: isLastMessageStreaming,
      })}
    />
  );

  return (
    <>
      {isAiChatInboxEnabled && agentChatFirstUnreadMessageId === messageId && (
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
            {getAgentChatSenderLabel({
              sender,
              isCurrentWorkspaceMember: isOwnMessage,
            })}
          </StyledSender>
        )}
        <StyledMessageContainer isUser={isUser}>
          {isUser ? (
            <AiChatUserMessageText
              messageId={messageId}
              text={messageText}
              quote={messageQuote}
              isOtherMember={isAiChatInboxEnabled && !isOwnMessage}
            >
              {messageContent}
            </AiChatUserMessageText>
          ) : (
            <StyledChatMessageBubble>{messageContent}</StyledChatMessageBubble>
          )}
          {isNonEmptyArray(fileParts) && (
            <StyledFilesContainer>
              {fileParts.map((file) => (
                <AgentChatFilePreview key={file.filename} file={file} />
              ))}
            </StyledFilesContainer>
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
                    setAgentChatQuotedMessageId(messageId);
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
