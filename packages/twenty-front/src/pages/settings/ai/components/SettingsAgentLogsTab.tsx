import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useMutation, useQuery } from '@apollo/client';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import Skeleton from 'react-loading-skeleton';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
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
import { EVALUATE_AGENT_TURN } from '../graphql/mutations/evaluateAgentTurn';
import { GET_AGENT_TURNS } from '../graphql/queries/getAgentTurns';

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

const StyledEvaluationCell = styled(TableCell)`
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

  const { data, loading, refetch } = useQuery(GET_AGENT_TURNS, {
    variables: { agentId },
    skip: !agentId,
  });

  const [evaluateTurn, { loading: evaluating }] = useMutation(
    EVALUATE_AGENT_TURN,
    {
      onCompleted: () => {
        enqueueSuccessSnackBar({
          message: t`Turn evaluated successfully`,
        });
        refetch();
      },
      onError: () => {
        enqueueErrorSnackBar({
          message: t`Failed to evaluate turn`,
        });
      },
    },
  );

  const turns = data?.agentTurns || [];

  const getLatestEvaluation = (evaluations: any[]) => {
    if (!evaluations || evaluations.length === 0) return null;
    return [...evaluations].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0];
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'orange';
    return 'red';
  };

  if (loading) {
    return (
      <StyledTable>
        <StyledTableHeaderRow>
          <TableHeader>{t`Date`}</TableHeader>
          <TableHeader>{t`Score`}</TableHeader>
          <TableHeader>{t`Evaluation`}</TableHeader>
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
        <TableHeader>{t`Evaluation`}</TableHeader>
        <TableHeader />
      </StyledTableHeaderRow>
      {turns.map((turn: any) => {
        const latestEvaluation = getLatestEvaluation(turn.evaluations);

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
              ) : (
                <span>-</span>
              )}
            </StyledScoreCell>
            <StyledEvaluationCell>
              {latestEvaluation ? (
                latestEvaluation.comment || t`No comment`
              ) : (
                <Button
                  size="small"
                  variant="secondary"
                  onClick={() =>
                    evaluateTurn({ variables: { turnId: turn.id } })
                  }
                  disabled={evaluating}
                  title={t`Evaluate`}
                />
              )}
            </StyledEvaluationCell>
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
