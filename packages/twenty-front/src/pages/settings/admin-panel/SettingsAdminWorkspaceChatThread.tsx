import { useParams } from 'react-router-dom';

import { useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

import { AgentMessageRole } from '@/ai/constants/AgentMessageRole';
import { LazyMarkdownRenderer } from '@/ai/components/LazyMarkdownRenderer';
import { AI_ADMIN_PATH } from '@/settings/admin-panel/ai/constants/AiAdminPath';
import { GET_ADMIN_CHAT_THREAD_MESSAGES } from '@/settings/admin-panel/graphql/queries/getAdminChatThreadMessages';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { styled } from '@linaria/react';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { Card, Section } from 'twenty-ui/layout';
import { H2Title } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { type GetAdminChatThreadMessagesQuery } from '~/generated-metadata/graphql';

const StyledMessagesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledMessageBubble = styled.div<{ isUser?: boolean }>`
  align-items: ${({ isUser }) => (isUser ? 'flex-end' : 'flex-start')};
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledMessageContent = styled.div<{ isUser?: boolean }>`
  background: ${({ isUser }) =>
    isUser ? themeCssVariables.background.tertiary : 'transparent'};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${({ isUser }) =>
    isUser
      ? themeCssVariables.font.color.secondary
      : themeCssVariables.font.color.primary};
  font-weight: ${({ isUser }) => (isUser ? 500 : 400)};
  line-height: 1.4em;
  max-width: 100%;
  overflow-wrap: break-word;
  padding: ${({ isUser }) =>
    isUser ? `0 ${themeCssVariables.spacing[2]}` : '0'};
  white-space: ${({ isUser }) => (isUser ? 'pre-wrap' : 'normal')};
  width: ${({ isUser }) => (isUser ? 'fit-content' : '100%')};
`;

const StyledRoleLabel = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  margin-bottom: ${themeCssVariables.spacing[1]};
  text-transform: capitalize;
`;

const StyledTimestamp = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
  margin-top: ${themeCssVariables.spacing[1]};
`;

export const SettingsAdminWorkspaceChatThread = () => {
  const { workspaceId, threadId } = useParams<{
    workspaceId: string;
    threadId: string;
  }>();

  const { data, loading: isLoading } =
    useQuery<GetAdminChatThreadMessagesQuery>(GET_ADMIN_CHAT_THREAD_MESSAGES, {
      variables: { threadId },
      skip: !threadId,
    });

  const thread = data?.getAdminChatThreadMessages?.thread;
  const messages = data?.getAdminChatThreadMessages?.messages ?? [];

  const threadTitle = thread?.title || t`Untitled`;

  if (isLoading) {
    return <SettingsSkeletonLoader />;
  }

  return (
    <SubMenuTopBarContainer
      links={[
        {
          children: t`Other`,
          href: getSettingsPath(SettingsPath.AdminPanel),
        },
        {
          children: t`Admin Panel`,
          href: getSettingsPath(SettingsPath.AdminPanel),
        },
        {
          children: t`AI`,
          href: AI_ADMIN_PATH,
        },
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.AdminPanelWorkspaceDetail, {
            workspaceId: workspaceId ?? '',
          }),
        },
        {
          children: threadTitle,
        },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title title={threadTitle} description={t`Chat conversation`} />

          {messages.length === 0 ? (
            <Card rounded>
              <TableRow gridTemplateColumns="1fr">
                <TableCell
                  color={themeCssVariables.font.color.tertiary}
                  align="center"
                >
                  {t`No messages found.`}
                </TableCell>
              </TableRow>
            </Card>
          ) : (
            <StyledMessagesContainer>
              {messages
                .filter((message) => message.role !== AgentMessageRole.SYSTEM)
                .map((message) => {
                  const isUser = message.role === AgentMessageRole.USER;
                  const textParts = message.parts
                    .filter(
                      (part) =>
                        part.type === 'text' && part.textContent !== null,
                    )
                    .map((part) => part.textContent)
                    .join('\n');

                  const toolParts = message.parts.filter(
                    (part) =>
                      part.type === 'tool-call' && part.toolName !== null,
                  );

                  if (textParts.length === 0 && toolParts.length === 0) {
                    return null;
                  }

                  return (
                    <StyledMessageBubble key={message.id} isUser={isUser}>
                      <StyledRoleLabel>{message.role}</StyledRoleLabel>
                      {textParts.length > 0 && (
                        <StyledMessageContent isUser={isUser}>
                          {isUser ? (
                            textParts
                          ) : (
                            <LazyMarkdownRenderer text={textParts} />
                          )}
                        </StyledMessageContent>
                      )}
                      {toolParts.map((part, index) => (
                        <StyledMessageContent key={index} isUser={false}>
                          {t`Tool call: ${part.toolName}`}
                        </StyledMessageContent>
                      ))}
                      <StyledTimestamp>
                        {new Date(message.createdAt).toLocaleString()}
                      </StyledTimestamp>
                    </StyledMessageBubble>
                  );
                })}
            </StyledMessagesContainer>
          )}
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
