import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { Avatar, IconSparkles } from 'twenty-ui/display';

import { AgentChatFilePreview } from '@/ai/components/internal/AgentChatFilePreview';
import { AgentChatMessageRole } from '@/ai/constants/AgentChatMessageRole';
import { LightCopyIconButton } from '@/object-record/record-field/ui/components/LightCopyIconButton';

import { AIChatAssistantMessageRenderer } from '@/ai/components/AIChatAssistantMessageRenderer';
import { type AgentChatMessage } from '~/generated/graphql';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';
const StyledMessageBubble = styled.div<{ isUser?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  position: relative;
  width: 100%;

  &:hover .message-footer {
    opacity: 1;
    pointer-events: auto;
  }
`;

const StyledMessageRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing(3)};
  width: 100%;
`;

const StyledMessageText = styled.div<{ isUser?: boolean }>`
  background: ${({ theme, isUser }) =>
    isUser ? theme.background.secondary : theme.background.transparent};
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme, isUser }) => (isUser ? theme.spacing(1, 2) : 0)};
  border: ${({ isUser, theme }) =>
    !isUser ? 'none' : `1px solid ${theme.border.color.light}`};
  color: ${({ theme, isUser }) =>
    isUser ? theme.font.color.light : theme.font.color.primary};
  font-weight: ${({ isUser }) => (isUser ? 500 : 400)};
  width: fit-content;
  max-width: 100%;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;

  code {
    overflow: auto;
    white-space: pre-wrap;
    word-wrap: break-word;
    max-width: 100%;
    line-height: 1.4;
    padding: ${({ theme }) => theme.spacing(1)};
    border-radius: ${({ theme }) => theme.border.radius.sm};
    background: ${({ theme }) => theme.background.tertiary};
  }

  pre {
    background: ${({ theme }) => theme.background.tertiary};
    padding: ${({ theme }) => theme.spacing(2)};
    border-radius: ${({ theme }) => theme.border.radius.sm};
    overflow-x: auto;
    max-width: 100%;

    code {
      padding: 0;
      border-radius: 0;
      background: none;
    }
  }

  p {
    margin: ${({ theme }) => theme.spacing(1)} 0;
    line-height: 1.5;
  }

  ul,
  ol {
    margin: ${({ theme }) => theme.spacing(1)} 0;
    padding-left: ${({ theme }) => theme.spacing(4)};
  }

  li {
    margin: ${({ theme }) => theme.spacing(0.5)} 0;
  }

  blockquote {
    border-left: 3px solid ${({ theme }) => theme.border.color.medium};
    margin: ${({ theme }) => theme.spacing(2)} 0;
    padding-left: ${({ theme }) => theme.spacing(2)};
    color: ${({ theme }) => theme.font.color.secondary};
  }
`;

const StyledMessageFooter = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  justify-content: space-between;
  margin-top: ${({ theme }) => theme.spacing(1)};
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease-in-out;
  width: 100%;
`;

const StyledAvatarContainer = styled.div<{ isUser?: boolean }>`
  align-items: center;
  background: ${({ theme, isUser }) =>
    isUser
      ? theme.background.transparent.light
      : theme.background.transparent.blue};
  display: flex;
  justify-content: center;
  height: 24px;
  min-width: 24px;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  padding: 1px;
`;

const StyledMessageContainer = styled.div`
  width: 100%;
`;

const StyledFilesContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
  flex-wrap: wrap;
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

export const AIChatMessage = ({
  message,
  agentStreamingMessage,
}: {
  message: AgentChatMessage;
  agentStreamingMessage: string;
}) => {
  const theme = useTheme();
  const { localeCatalog } = useRecoilValue(dateLocaleState);

  return (
    <StyledMessageBubble
      key={message.id}
      isUser={message.role === AgentChatMessageRole.USER}
    >
      <StyledMessageRow>
        {message.role === AgentChatMessageRole.ASSISTANT && (
          <StyledAvatarContainer>
            <Avatar
              size="sm"
              placeholder="AI"
              Icon={IconSparkles}
              iconColor={theme.color.blue}
            />
          </StyledAvatarContainer>
        )}
        {message.role === AgentChatMessageRole.USER && (
          <StyledAvatarContainer isUser>
            <Avatar size="sm" placeholder="U" type="rounded" />
          </StyledAvatarContainer>
        )}
        <StyledMessageContainer>
          <StyledMessageText
            isUser={message.role === AgentChatMessageRole.USER}
          >
            {message.role === AgentChatMessageRole.ASSISTANT ? (
              <AIChatAssistantMessageRenderer
                streamData={message.rawContent || agentStreamingMessage}
              />
            ) : (
              message.rawContent
            )}
          </StyledMessageText>
          {message.files.length > 0 && (
            <StyledFilesContainer>
              {message.files.map((file) => (
                <AgentChatFilePreview key={file.id} file={file} />
              ))}
            </StyledFilesContainer>
          )}
          {message.rawContent && (
            <StyledMessageFooter className="message-footer">
              <span>
                {beautifyPastDateRelativeToNow(
                  message.createdAt,
                  localeCatalog,
                )}
              </span>
              <LightCopyIconButton copyText={message.rawContent} />
            </StyledMessageFooter>
          )}
        </StyledMessageContainer>
      </StyledMessageRow>
    </StyledMessageBubble>
  );
};
