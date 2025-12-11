import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { IconChevronRight, Status } from 'twenty-ui/display';
import { Button, LightIconButton } from 'twenty-ui/input';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
} from 'twenty-ui/layout';
import { UndecoratedLink } from 'twenty-ui/navigation';
import {
  useEvaluateAgentTurnMutation,
  useGetAgentTurnsQuery,
} from '~/generated-metadata/graphql';

const StyledTable = styled(Table)`
  margin-top: ${({ theme }) => theme.spacing(3)};
`;

const StyledTableHeaderRow = styled(TableRow)`
  grid-template-columns: 140px 80px 1fr 40px;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledTableRow = styled(TableRow)`
  grid-template-columns: 140px 80px 1fr 40px;
`;

const StyledScoreCell = styled(TableCell)`
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledDateCell = styled(TableCell)`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledInputCell = styled(TableCell)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledActionCell = styled(TableCell)`
  justify-content: flex-end;
  padding-right: ${({ theme }) => theme.spacing(2)};
`;

type SettingsAgentLogsTabProps = {
  agentId: string;
};

export const SettingsAgentLogsTab = ({
  agentId,
}: SettingsAgentLogsTabProps) => {
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const [evaluatingTurnIds, setEvaluatingTurnIds] = useState<Set<string>>(
    new Set(),
  );

  const getLatestEvaluation = (evaluations: any[]) => {
    if (!evaluations || evaluations.length === 0) return null;
    return [...evaluations].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0];
  };

  const computeBackgroundEvaluatingTurnIds = (turnsData: any[]) => {
    const now = Date.now();
    const RECENT_TURN_THRESHOLD = 5 * 60 * 1000;
    const backgroundEvaluatingTurnIds = new Set<string>();

    turnsData.forEach((turn: any) => {
      const latestEvaluation = getLatestEvaluation(turn.evaluations);
      const turnAge = now - new Date(turn.createdAt).getTime();

      if (!isDefined(latestEvaluation) && turnAge < RECENT_TURN_THRESHOLD) {
        backgroundEvaluatingTurnIds.add(turn.id);
      }
    });

    return backgroundEvaluatingTurnIds;
  };

  const { data, loading, refetch, startPolling, stopPolling } =
    useGetAgentTurnsQuery({
      variables: { agentId },
      skip: !agentId,
      onCompleted: (completedData) => {
        const backgroundIds = computeBackgroundEvaluatingTurnIds(
          completedData?.agentTurns || [],
        );
        if (backgroundIds.size > 0) {
          startPolling(3000);
        } else {
          stopPolling();
        }
      },
    });

  const turns = data?.agentTurns || [];
  const backgroundEvaluatingTurnIds = computeBackgroundEvaluatingTurnIds(turns);

  const [evaluateTurn, { loading: evaluating }] = useEvaluateAgentTurnMutation({
    onCompleted: (data) => {
      const turnId = data?.evaluateAgentTurn?.turnId;
      if (isDefined(turnId)) {
        setEvaluatingTurnIds((prev) => {
          const next = new Set(prev);
          next.delete(turnId);
          return next;
        });
      }
      enqueueSuccessSnackBar({
        message: t`Turn evaluated successfully`,
      });
      refetch();
    },
  });

  const handleEvaluateTurn = (turnId: string) => {
    setEvaluatingTurnIds((prev) => new Set(prev).add(turnId));
    evaluateTurn({ variables: { turnId } }).catch(() => {
      setEvaluatingTurnIds((prev) => {
        const next = new Set(prev);
        next.delete(turnId);
        return next;
      });
      enqueueErrorSnackBar({
        message: t`Failed to evaluate turn`,
      });
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'orange';
    return 'red';
  };

  const getUserMessageInput = (messages: any[]) => {
    const userMessage = messages?.find((message) => message.role === 'user');
    if (!userMessage) return null;

    const textParts = userMessage.parts
      ?.filter((part: any) => part.type === 'text' && part.textContent)
      .map((part: any) => part.textContent);

    return textParts?.join(' ') || null;
  };

  if (loading) {
    return (
      <StyledTable>
        <StyledTableHeaderRow>
          <TableHeader>{t`Date`}</TableHeader>
          <TableHeader>{t`Score`}</TableHeader>
          <TableHeader>{t`Input`}</TableHeader>
          <TableHeader />
        </StyledTableHeaderRow>
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton height={48} borderRadius={4} key={index} />
        ))}
      </StyledTable>
    );
  }

  if (turns.length === 0) {
    return (
      <AnimatedPlaceholderEmptyContainer>
        <AnimatedPlaceholder type="emptyTimeline" />
        <AnimatedPlaceholderEmptyTextContainer>
          <AnimatedPlaceholderEmptyTitle>
            {t`No logs yet`}
          </AnimatedPlaceholderEmptyTitle>
          <AnimatedPlaceholderEmptySubTitle>
            {t`Agent interactions will appear here once the agent is used in conversations`}
          </AnimatedPlaceholderEmptySubTitle>
        </AnimatedPlaceholderEmptyTextContainer>
      </AnimatedPlaceholderEmptyContainer>
    );
  }

  return (
    <StyledTable>
      <StyledTableHeaderRow>
        <TableHeader>{t`Date`}</TableHeader>
        <TableHeader>{t`Score`}</TableHeader>
        <TableHeader>{t`Input`}</TableHeader>
        <TableHeader />
      </StyledTableHeaderRow>
      {turns.map((turn: any) => {
        const latestEvaluation = getLatestEvaluation(turn.evaluations);
        const userInput = getUserMessageInput(turn.messages);

        return (
          <StyledTableRow key={turn.id}>
            <StyledDateCell>
              {new Date(turn.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </StyledDateCell>
            <StyledScoreCell>
              {latestEvaluation ? (
                <Status
                  color={getScoreColor(latestEvaluation.score)}
                  text={`${latestEvaluation.score}`}
                />
              ) : evaluatingTurnIds.has(turn.id) ||
                backgroundEvaluatingTurnIds.has(turn.id) ? (
                <Status color="blue" text={t`Evaluating`} isLoaderVisible />
              ) : (
                <Button
                  size="small"
                  variant="secondary"
                  onClick={() => handleEvaluateTurn(turn.id)}
                  disabled={evaluating}
                  title={t`Evaluate`}
                />
              )}
            </StyledScoreCell>
            <StyledInputCell>{userInput || t`No input`}</StyledInputCell>
            <StyledActionCell>
              {latestEvaluation && (
                <UndecoratedLink
                  to={getSettingsPath(SettingsPath.AIAgentTurnDetail)
                    .replace(':agentId', agentId)
                    .replace(':turnId', turn.id)}
                >
                  <LightIconButton
                    Icon={IconChevronRight}
                    title={t`View all evaluations`}
                    accent="tertiary"
                  />
                </UndecoratedLink>
              )}
            </StyledActionCell>
          </StyledTableRow>
        );
      })}
    </StyledTable>
  );
};
