import { AIChatAssistantMessageRenderer } from '@/ai/components/AIChatAssistantMessageRenderer';
import { mapDBMessagesToUIMessages } from '@/ai/utils/mapDBMessagesToUIMessages';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import Skeleton from 'react-loading-skeleton';
import { useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { H2Title, Status } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { GetAgentTurnsDocument } from '~/generated-metadata/graphql';

const StyledTableContainer = styled.div`
  margin-top: ${themeCssVariables.spacing[3]};
`;

const StyledTableHeaderRowContainer = styled.div`
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledMessagesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledMessageBubble = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledMessageRole = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  text-transform: uppercase;
`;

const StyledMessageContent = styled.div`
  color: ${themeCssVariables.font.color.primary};
  max-width: 100%;
`;

export const SettingsAgentTurnDetail = () => {
  const { agentId, turnId } = useParams<{
    agentId: string;
    turnId: string;
  }>();

  const { data, loading } = useQuery(GetAgentTurnsDocument, {
    variables: { agentId: agentId || '' },
    skip: !agentId,
  });

  const turn = data?.agentTurns?.find((t: any) => t.id === turnId);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'orange';
    return 'red';
  };

  if (loading) {
    return (
      <SubMenuTopBarContainer
        title={t`Turn Details`}
        links={[
          {
            children: t`Workspace`,
            href: getSettingsPath(SettingsPath.Workspace),
          },
          { children: t`AI`, href: getSettingsPath(SettingsPath.AI) },
          {
            children: t`Agent`,
            href: getSettingsPath(SettingsPath.AIAgentDetail).replace(
              ':agentId',
              agentId || '',
            ),
          },
          { children: t`Turn` },
        ]}
      >
        <SettingsPageContainer>
          <Skeleton height={200} />
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    );
  }

  if (!turn) {
    return (
      <SubMenuTopBarContainer
        title={t`Turn Not Found`}
        links={[
          {
            children: t`Workspace`,
            href: getSettingsPath(SettingsPath.Workspace),
          },
          { children: t`AI`, href: getSettingsPath(SettingsPath.AI) },
          { children: t`Turn` },
        ]}
      >
        <SettingsPageContainer>
          <div>{t`Turn not found`}</div>
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    );
  }

  return (
    <SubMenuTopBarContainer
      title={t`Turn Details`}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: t`AI`, href: getSettingsPath(SettingsPath.AI) },
        {
          children: t`Agent`,
          href: getSettingsPath(SettingsPath.AIAgentDetail).replace(
            ':agentId',
            agentId || '',
          ),
        },
        { children: t`Turn` },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Messages`}
            description={new Date(turn.createdAt).toLocaleString('en-US', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          />
          {turn.messages && turn.messages.length > 0 ? (
            <StyledMessagesContainer>
              {mapDBMessagesToUIMessages(
                [...turn.messages]
                  .filter((msg: any) => msg.parts && msg.parts.length > 0)
                  .sort((a: any, b: any) => {
                    if (a.role === 'user' && b.role === 'assistant') return -1;
                    if (a.role === 'assistant' && b.role === 'user') return 1;
                    return (
                      new Date(a.createdAt).getTime() -
                      new Date(b.createdAt).getTime()
                    );
                  }),
              ).map((message) => {
                const roleLabel =
                  message.role === 'user'
                    ? t`User`
                    : message.role === 'system'
                      ? t`System`
                      : t`Assistant`;
                return (
                  <StyledMessageBubble key={message.id}>
                    <StyledMessageRole>{roleLabel}</StyledMessageRole>
                    <StyledMessageContent>
                      <AIChatAssistantMessageRenderer
                        messageParts={message.parts}
                        isLastMessageStreaming={false}
                      />
                    </StyledMessageContent>
                  </StyledMessageBubble>
                );
              })}
            </StyledMessagesContainer>
          ) : (
            <div>{t`No messages found for this turn`}</div>
          )}
        </Section>

        <Section>
          <H2Title title={t`Evaluations`} />
          {turn.evaluations && turn.evaluations.length > 0 ? (
            <StyledTableContainer>
              <Table>
                <StyledTableHeaderRowContainer>
                  <TableRow gridTemplateColumns="140px 80px 1fr">
                    <TableHeader>{t`Date`}</TableHeader>
                    <TableHeader>{t`Score`}</TableHeader>
                    <TableHeader>{t`Comment`}</TableHeader>
                  </TableRow>
                </StyledTableHeaderRowContainer>
                {[...turn.evaluations]
                  .sort(
                    (a: any, b: any) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime(),
                  )
                  .map((evaluation: any) => (
                    <TableRow
                      key={evaluation.id}
                      gridTemplateColumns="140px 80px 1fr"
                    >
                      <TableCell color={themeCssVariables.font.color.tertiary}>
                        {new Date(evaluation.createdAt).toLocaleDateString(
                          'en-US',
                          {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          },
                        )}
                      </TableCell>
                      <TableCell gap={themeCssVariables.spacing[2]}>
                        <Status
                          color={getScoreColor(evaluation.score)}
                          text={`${evaluation.score}`}
                        />
                      </TableCell>
                      <TableCell
                        overflow="hidden"
                        textOverflow="ellipsis"
                        whiteSpace="nowrap"
                      >
                        {evaluation.comment || t`No comment`}
                      </TableCell>
                    </TableRow>
                  ))}
              </Table>
            </StyledTableContainer>
          ) : (
            <div>{t`No evaluations yet for this turn`}</div>
          )}
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
