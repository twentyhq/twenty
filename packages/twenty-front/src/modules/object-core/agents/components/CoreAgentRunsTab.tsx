import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { CoreAgentRunConversation } from '@/object-core/agents/components/CoreAgentRunConversation';
import { CoreAgentRunRow } from '@/object-core/agents/components/CoreAgentRunRow';
import { CORE_AGENT_RUNS_GRID_TEMPLATE_COLUMNS } from '@/object-core/agents/constants/CoreAgentRunsGridTemplateColumns';
import { groupCoreAgentRunsByConversation } from '@/object-core/agents/utils/groupCoreAgentRunsByConversation';
import { AnimatedPlaceholder } from '@/ui/feedback/empty-state/components/AnimatedPlaceholder/AnimatedPlaceholder';
import { EmptyState } from '@/ui/feedback/empty-state/components/EmptyState';
import { SkeletonLine } from '@/ui/feedback/skeleton/components/SkeletonLine';
import { LEGACY_SKELETON_COLORS } from '@/ui/feedback/skeleton/constants/LEGACY_SKELETON_COLORS';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { GetAgentRunsDocument } from '~/generated-metadata/graphql';

const RUNS_POLL_INTERVAL_MS = 10000;

const StyledTableContainer = styled.div`
  margin-top: ${themeCssVariables.spacing[3]};
`;

const StyledTableHeaderRowContainer = styled.div`
  margin-bottom: ${themeCssVariables.spacing[2]};
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

type CoreAgentRunsTabProps = {
  agentId: string;
};

export const CoreAgentRunsTab = ({ agentId }: CoreAgentRunsTabProps) => {
  const [expandedRunIds, setExpandedRunIds] = useState<Set<string>>(new Set());
  const [expandedThreadIds, setExpandedThreadIds] = useState<Set<string>>(
    new Set(),
  );

  // runs start and settle outside this page, so the list refreshes while it is visible
  const { data, loading, error } = useQuery(GetAgentRunsDocument, {
    variables: { agentId },
    pollInterval: RUNS_POLL_INTERVAL_MS,
    skipPollAttempt: () => document.hidden,
  });

  const runs = data?.agentRuns ?? [];

  const header = (
    <StyledTableHeaderRowContainer>
      <TableRow gridTemplateColumns={CORE_AGENT_RUNS_GRID_TEMPLATE_COLUMNS}>
        <TableHeader>{t`Status`}</TableHeader>
        <TableHeader>{t`Started`}</TableHeader>
        <TableHeader>{t`Source`}</TableHeader>
        <TableHeader>{t`Input`}</TableHeader>
        <TableHeader align="right">{t`Tokens`}</TableHeader>
        <TableHeader align="right">{t`Credits`}</TableHeader>
        <TableHeader align="right">{t`Duration`}</TableHeader>
      </TableRow>
    </StyledTableHeaderRowContainer>
  );

  if (loading && runs.length === 0) {
    return (
      <StyledTableContainer>
        <Table>
          {header}
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonLine
              baseColor={LEGACY_SKELETON_COLORS.base}
              highlightColor={LEGACY_SKELETON_COLORS.highlight}
              height={32}
              borderRadius={4}
              key={index}
            />
          ))}
        </Table>
      </StyledTableContainer>
    );
  }

  if (isDefined(error) && runs.length === 0) {
    return (
      <EmptyState.Root>
        <AnimatedPlaceholder type="errorIndex" />
        <EmptyState.Content>
          <EmptyState.Title>{t`Could not load runs`}</EmptyState.Title>
          <EmptyState.Description>
            {t`Try again in a moment`}
          </EmptyState.Description>
        </EmptyState.Content>
      </EmptyState.Root>
    );
  }

  if (runs.length === 0) {
    return (
      <EmptyState.Root>
        <AnimatedPlaceholder type="emptyTimeline" />
        <EmptyState.Content>
          <EmptyState.Title>{t`No runs yet`}</EmptyState.Title>
          <EmptyState.Description>
            {t`Runs appear here once a workflow or an app uses this agent`}
          </EmptyState.Description>
        </EmptyState.Content>
      </EmptyState.Root>
    );
  }

  const handleToggleRun = (runId: string) =>
    setExpandedRunIds((runIds) => toggleId(runIds, runId));

  return (
    <StyledTableContainer>
      <Table>
        {header}
        {groupCoreAgentRunsByConversation(runs).map((item) =>
          item.type === 'conversation' ? (
            <CoreAgentRunConversation
              key={item.threadId}
              title={item.title}
              runs={item.runs}
              isExpanded={expandedThreadIds.has(item.threadId)}
              onToggle={() =>
                setExpandedThreadIds((threadIds) =>
                  toggleId(threadIds, item.threadId),
                )
              }
              expandedRunIds={expandedRunIds}
              onToggleRun={handleToggleRun}
            />
          ) : (
            <CoreAgentRunRow
              key={item.run.id}
              run={item.run}
              isExpanded={expandedRunIds.has(item.run.id)}
              onToggle={() => handleToggleRun(item.run.id)}
            />
          ),
        )}
      </Table>
    </StyledTableContainer>
  );
};
