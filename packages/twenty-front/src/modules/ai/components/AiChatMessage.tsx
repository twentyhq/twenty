import { useLingui } from '@lingui/react/macro';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useAiChatSentMessageHandOff } from '@/ai/hooks/useAiChatSentMessageHandOff';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { AgentChatFilePreview } from '@/ai/components/internal/AgentChatFilePreview';
import { AGENT_MESSAGE_ROLE } from '@/ai/constants/AgentMessageRole';

import { AiChatAssistantAvatar } from '@/ai/components/AiChatAssistantAvatar';
import { AiChatAssistantMessageRenderer } from '@/ai/components/AiChatAssistantMessageRenderer';
import { AiChatMessageHeader } from '@/ai/components/AiChatMessageHeader';
import { AiChatMessageReactionPicker } from '@/ai/components/AiChatMessageReactionPicker';
import { AiChatMessageReactions } from '@/ai/components/AiChatMessageReactions';
import { AGENT_CHAT_ASSISTANT_NAME } from '@/ai/constants/AgentChatAssistantName';
import { AiChatErrorRenderer } from '@/ai/components/AiChatErrorRenderer';
import { agentChatFirstUnreadMessageIdSelector } from '@/ai/states/selectors/agentChatFirstUnreadMessageIdSelector';
import { agentChatIsMessageBeforeFirstUserMessageFamilySelector } from '@/ai/states/selectors/agentChatIsMessageBeforeFirstUserMessageFamilySelector';
import { agentChatMessageFamilySelector } from '@/ai/states/selectors/agentChatMessageFamilySelector';
import { getAgentChatSenderLabel } from '@/ai/utils/getAgentChatSenderLabel';
import { isSilentAgentChatMessage } from '@/ai/utils/isSilentAgentChatMessage';
import { getAgentChatMessageWorkDurationMs } from '@/ai/utils/getAgentChatMessageWorkDurationMs';
import { type AiChatError } from '@/ai/types/AiChatError';
import { LightCopyIconButton } from '@/ui/input/components/LightCopyIconButton';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

import { isExtendedFileUIPart } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';
import { LabeledDivider } from '@/ui/layout/line/components/LabeledDivider';
import { dateLocaleState } from '@/localization/states/dateLocaleState';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const StyledMessageBubble = styled.div<{ isRightAligned: boolean }>`
  align-items: ${({ isRightAligned }) =>
    isRightAligned ? 'flex-end' : 'flex-start'};
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;

  &:hover .message-footer {
    opacity: 1;
    pointer-events: auto;
  }
`;

const StyledMessageText = styled.div<{ isUser?: boolean }>`
  background: ${({ isUser }) =>
    isUser ? themeCssVariables.background.tertiary : 'transparent'};
  border-radius: ${({ isUser }) =>
    isUser ? themeCssVariables.border.radius.lg : '0'};
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${({ isUser }) => (isUser ? 500 : 400)};
  line-height: 1.4em;
  max-width: 100%;
  overflow-wrap: break-word;
  padding: ${({ isUser }) =>
    isUser ? `0 ${themeCssVariables.spacing[2]}` : '0'};
  white-space: normal;
  width: ${({ isUser }) => (isUser ? 'fit-content' : '100%')};
  /* Pre-wrap on the container turns newlines between blocks into spacing; only code pre-wraps. */
  word-wrap: break-word;

  code {
    background: ${themeCssVariables.background.tertiary};
    border-radius: ${themeCssVariables.border.radius.sm};
    line-height: 1.4;
    max-width: 100%;
    overflow: auto;
    padding: 1px 3px;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  pre {
    background: ${themeCssVariables.background.tertiary};
    border-radius: ${themeCssVariables.border.radius.sm};
    max-width: 100%;
    overflow-x: auto;
    padding: ${themeCssVariables.spacing[2]};

    code {
      background: none;
      border-radius: 0;
      padding: 0;
    }
  }

  p {
    line-height: 1.4em;
    margin-block: ${({ isUser }) =>
      isUser ? '0' : themeCssVariables.spacing[1]};
  }

  blockquote {
    border-left: 3px solid ${themeCssVariables.border.color.medium};
    color: ${themeCssVariables.font.color.secondary};
    margin: ${themeCssVariables.spacing[2]} 0;
    padding-left: ${themeCssVariables.spacing[2]};
  }
`;

const StyledMessageFooter = styled.div<{ isSpreadOut: boolean }>`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  justify-content: ${({ isSpreadOut }) =>
    isSpreadOut ? 'space-between' : 'flex-start'};
  margin-top: ${themeCssVariables.spacing[1]};
  opacity: 0;
  pointer-events: none;
  transition: opacity calc(${themeCssVariables.animation.duration.normal} * 1s)
    ease-in-out;
  width: 100%;
`;

const StyledSender = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  margin-bottom: ${themeCssVariables.spacing[1]};
`;

const StyledMessageTimestamp = styled.span`
  color: ${themeCssVariables.font.color.light};
`;

const StyledMessageContainer = styled.div<{ isUser?: boolean }>`
  max-width: 100%;
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
  children: ReactNode;
};

const AiChatUserMessageText = ({
  messageId,
  children,
}: AiChatUserMessageTextProps) => {
  const sentMessageHandOffRef = useAiChatSentMessageHandOff(messageId);

  return (
    <StyledMessageText isUser ref={sentMessageHandOffRef}>
      {children}
    </StyledMessageText>
  );
};

type AiChatMessageProps = {
  messageId: string;
  isLastMessageStreaming?: boolean;
  error?: AiChatError;
};

export const AiChatMessage = ({
  messageId,
  isLastMessageStreaming = false,
  error,
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

  const { localeCatalog } = useAtomStateValue(dateLocaleState);
  const agentChatFirstUnreadMessageId = useAtomStateValue(
    agentChatFirstUnreadMessageIdSelector,
  );
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );

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
  const senderLabel = getAgentChatSenderLabel({
    sender,
    isCurrentWorkspaceMember: senderId === currentWorkspaceMember?.id,
  });
  const isUser = agentChatMessage.role === AGENT_MESSAGE_ROLE.USER;
  const createdAt = agentChatMessage.metadata?.createdAt ?? new Date();
  const hasHeader = isAiChatInboxEnabled && (!isUser || isDefined(senderId));
  const shouldShowError =
    isDefined(error) && agentChatMessage.role === AGENT_MESSAGE_ROLE.ASSISTANT;

  const fileParts = agentChatMessage.parts.filter(isExtendedFileUIPart);
  const messageContent = (
    <AiChatAssistantMessageRenderer
      isLastMessageStreaming={isLastMessageStreaming}
      messageParts={agentChatMessage.parts}
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
        <LabeledDivider
          textPosition="end"
          color={themeCssVariables.tag.text.red}
          noMargin
        >{t`New`}</LabeledDivider>
      )}
      <StyledMessageBubble isRightAligned={isUser && !isAiChatInboxEnabled}>
        {isAiChatInboxEnabled && isUser && isDefined(senderId) && (
          <AiChatMessageHeader
            avatar={
              <Avatar
                src={getAbsoluteImageUrl(sender?.avatarUrl)}
                colorSeed={senderId}
                name={senderLabel}
                size="sm"
                shape="circle"
              />
            }
            name={senderLabel}
            createdAt={createdAt}
          />
        )}
        {isAiChatInboxEnabled && !isUser && (
          <AiChatMessageHeader
            avatar={<AiChatAssistantAvatar />}
            name={AGENT_CHAT_ASSISTANT_NAME}
            createdAt={createdAt}
          />
        )}
        {!isAiChatInboxEnabled && isUser && isDefined(senderId) && (
          <StyledSender>{senderLabel}</StyledSender>
        )}
        <StyledMessageContainer isUser={isUser}>
          {isUser ? (
            <AiChatUserMessageText messageId={messageId}>
              {messageContent}
            </AiChatUserMessageText>
          ) : (
            <StyledMessageText>{messageContent}</StyledMessageText>
          )}
          {fileParts.length > 0 && (
            <StyledFilesContainer>
              {fileParts.map((file) => (
                <AgentChatFilePreview key={file.filename} file={file} />
              ))}
            </StyledFilesContainer>
          )}
          {shouldShowError && <AiChatErrorRenderer error={error} />}
          {isAiChatInboxEnabled && (
            <AiChatMessageReactions messageId={messageId} />
          )}
        </StyledMessageContainer>
        {agentChatMessage.parts.length > 0 && (
          <StyledMessageFooter
            className="message-footer"
            isSpreadOut={!isAiChatInboxEnabled}
          >
            {!hasHeader && (
              <StyledMessageTimestamp>
                {beautifyPastDateRelativeToNow(createdAt, localeCatalog)}
              </StyledMessageTimestamp>
            )}
            <LightCopyIconButton
              copyText={
                agentChatMessage.parts.find((part) => part.type === 'text')
                  ?.text ?? ''
              }
            />
            {isAiChatInboxEnabled && !isLastMessageStreaming && (
              <AiChatMessageReactionPicker messageId={messageId} />
            )}
          </StyledMessageFooter>
        )}
      </StyledMessageBubble>
    </>
  );
};
