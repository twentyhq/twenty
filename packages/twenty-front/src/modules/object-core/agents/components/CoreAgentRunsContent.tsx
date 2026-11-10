import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  IconBolt,
  IconCalendarTime,
  IconCoins,
  IconStatusChange,
  IconSum,
  IconTextSize,
  IconTimeDuration30,
} from 'twenty-ui/icon';

import { useOpenAskAiThread } from '@/ai/hooks/useOpenAskAiThread';
import { CoreAgentRunConversation } from '@/object-core/agents/components/CoreAgentRunConversation';
import { CoreAgentRunRow } from '@/object-core/agents/components/CoreAgentRunRow';
import { CORE_AGENT_RUNS_GRID_TEMPLATE_COLUMNS } from '@/object-core/agents/constants/CoreAgentRunsGridTemplateColumns';
import { type CoreAgentRun } from '@/object-core/agents/types/CoreAgentRun';
import { groupCoreAgentRunsByConversation } from '@/object-core/agents/utils/groupCoreAgentRunsByConversation';
import { AnimatedPlaceholder } from '@/ui/feedback/empty-state/components/AnimatedPlaceholder/AnimatedPlaceholder';
import { EmptyState } from '@/ui/feedback/empty-state/components/EmptyState';
import { SkeletonLine } from '@/ui/feedback/skeleton/components/SkeletonLine';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableHeaderText } from '@/ui/layout/table/components/TableHeaderText';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { GetAgentRunsDocument } from '~/generated-metadata/graphql';
import { useLingui } from '@lingui/react/macro';

const RUNS_POLL_INTERVAL_MS = 10000;

const StyledTurnsContainer = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
`;

const StyledEmptyStateContainer = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
`;

const toggleId = (ids: Set<string>, id: string): Set<string> => {
  const nextIds = new Set(ids);

  if (nextIds.has(id)) {
    nextIds.delete(id);
  } else {
    nextIds.add(id);
  }

  return nextIds;
};

type CoreAgentRunsContentProps = {
  agentId: string;
};

export const CoreAgentRunsContent = ({
  agentId,
}: CoreAgentRunsContentProps) => {
  const { t } = useLingui();
  const [expandedRunIds, setExpandedRunIds] = useState<Set<string>>(new Set());
  const { openAskAiThread } = useOpenAskAiThread();

  // runs start and settle outside this page, so the list refreshes while it is visible
  const { data, loading, error } = useQuery(GetAgentRunsDocument, {
    variables: { agentId },
    pollInterval: RUNS_POLL_INTERVAL_MS,
    skipPollAttempt: () => document.hidden,
  });

  const runs = data?.agentRuns ?? [];

  const header = (
    <TableRow gridTemplateColumns={CORE_AGENT_RUNS_GRID_TEMPLATE_COLUMNS}>
      <TableHeader>
        <IconStatusChange size={14} />
        <TableHeaderText>{t`Status`}</TableHeaderText>
      </TableHeader>
      <TableHeader>
        <IconCalendarTime size={14} />
        <TableHeaderText>{t`Started`}</TableHeaderText>
      </TableHeader>
      <TableHeader>
        <IconBolt size={14} />
        <TableHeaderText>{t`Source`}</TableHeaderText>
      </TableHeader>
      <TableHeader>
        <IconTextSize size={14} />
        <TableHeaderText>{t`Input`}</TableHeaderText>
      </TableHeader>
      <TableHeader align="right">
        <IconSum size={14} />
        <TableHeaderText>{t`Tokens`}</TableHeaderText>
      </TableHeader>
      <TableHeader align="right">
        <IconCoins size={14} />
        <TableHeaderText>{t`Credits`}</TableHeaderText>
      </TableHeader>
      <TableHeader align="right">
        <IconTimeDuration30 size={14} />
        <TableHeaderText>{t`Duration`}</TableHeaderText>
      </TableHeader>
    </TableRow>
  );

  if (loading && runs.length === 0) {
    return (
      <Table>
        {header}
        {Array.from({ length: 3 }).map((_, index) => (
          <SkeletonLine height={32} key={index} />
        ))}
      </Table>
    );
  }

  if (isDefined(error) && runs.length === 0) {
    return (
      <StyledEmptyStateContainer>
        <EmptyState.Root>
          <AnimatedPlaceholder type="errorIndex" />
          <EmptyState.Content>
            <EmptyState.Title>{t`Could not load turns`}</EmptyState.Title>
            <EmptyState.Description>
              {t`Try again in a moment`}
            </EmptyState.Description>
          </EmptyState.Content>
        </EmptyState.Root>
      </StyledEmptyStateContainer>
    );
  }

  if (runs.length === 0) {
    return (
      <StyledEmptyStateContainer>
        <EmptyState.Root>
          <AnimatedPlaceholder type="emptyTimeline" />
          <EmptyState.Content>
            <EmptyState.Title>{t`No turns yet`}</EmptyState.Title>
            <EmptyState.Description>
              {t`Turns appear here once a workflow or an app uses this agent`}
            </EmptyState.Description>
          </EmptyState.Content>
        </EmptyState.Root>
      </StyledEmptyStateContainer>
    );
  }

  const handleRunClick = (
    run: Pick<CoreAgentRun, 'id' | 'threadId' | 'canReadThread'>,
  ) => {
    if (isDefined(run.threadId) && run.canReadThread) {
      openAskAiThread(run.threadId);
      return;
    }

    setExpandedRunIds((runIds) => toggleId(runIds, run.id));
  };

  return (
    <StyledTurnsContainer>
      <Table>
        {header}
        {groupCoreAgentRunsByConversation(runs).map((item) =>
          item.type === 'conversation' ? (
            <CoreAgentRunConversation
              key={item.threadId}
              threadId={item.threadId}
              title={item.title}
              runs={item.runs}
            />
          ) : (
            <CoreAgentRunRow
              key={item.run.id}
              run={item.run}
              isExpanded={expandedRunIds.has(item.run.id)}
              onClick={() => handleRunClick(item.run)}
            />
          ),
        )}
      </Table>
    </StyledTurnsContainer>
  );
};
