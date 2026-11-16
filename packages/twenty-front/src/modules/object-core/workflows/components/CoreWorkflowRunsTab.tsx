import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import {
  IconCalendarTime,
  IconStatusChange,
  IconTextSize,
  IconTimeDuration30,
  IconVersions,
} from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import {
  CoreObjectTableBody,
  CoreObjectTableRow,
} from '@/object-core/components/CoreObjectTableRow';
import { CoreObjectTableFetchMoreTrigger } from '@/object-core/components/CoreObjectTableFetchMoreTrigger';
import { CORE_WORKFLOW_RUNS_GRID_TEMPLATE_COLUMNS } from '@/object-core/workflows/constants/CoreWorkflowRunsGridTemplateColumns';
import { useCoreWorkflowRuns } from '@/object-core/workflows/hooks/useCoreWorkflowRuns';
import { handleCoreObjectTableRowKeyDown } from '@/object-core/utils/handleCoreObjectTableRowKeyDown';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { AnimatedPlaceholder } from '@/ui/feedback/empty-state/components/AnimatedPlaceholder/AnimatedPlaceholder';
import { EmptyState } from '@/ui/feedback/empty-state/components/EmptyState';
import { SkeletonLine } from '@/ui/feedback/skeleton/components/SkeletonLine';
import { DateTimeDisplay } from '@/ui/field/display/components/DateTimeDisplay';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableHeaderText } from '@/ui/layout/table/components/TableHeaderText';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { getWorkflowRunStatusTagProps } from '@/workflow/workflow-diagram/utils/getWorkflowRunStatusTagProps';
import { Tag } from 'twenty-ui/primitives/data-display';
import { formatDuration } from '~/utils/format/formatDuration';

type CoreWorkflowRunsTabProps = {
  coreWorkflowId: string;
  versionLabelById: Map<string, string>;
};

export const CoreWorkflowRunsTab = ({
  coreWorkflowId,
  versionLabelById,
}: CoreWorkflowRunsTabProps) => {
  const { t } = useLingui();
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();
  const { runs, loading, error, hasNextPage, fetchMoreRuns } =
    useCoreWorkflowRuns(coreWorkflowId);

  const header = (
    <TableRow gridTemplateColumns={CORE_WORKFLOW_RUNS_GRID_TEMPLATE_COLUMNS}>
      <TableHeader>
        <IconTextSize size={14} />
        <TableHeaderText>{t`Name`}</TableHeaderText>
      </TableHeader>
      <TableHeader>
        <IconStatusChange size={14} />
        <TableHeaderText>{t`Status`}</TableHeaderText>
      </TableHeader>
      <TableHeader>
        <IconCalendarTime size={14} />
        <TableHeaderText>{t`Started`}</TableHeaderText>
      </TableHeader>
      <TableHeader align="right">
        <IconTimeDuration30 size={14} />
        <TableHeaderText>{t`Duration`}</TableHeaderText>
      </TableHeader>
      <TableHeader>
        <IconVersions size={14} />
        <TableHeaderText>{t`Version`}</TableHeaderText>
      </TableHeader>
    </TableRow>
  );

  if (loading && runs.length === 0) {
    return (
      <Table>
        {header}
        {Array.from({ length: 3 }, (_, index) => (
          <SkeletonLine height={32} key={index} />
        ))}
      </Table>
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
            {t`Runs appear here once this workflow is triggered`}
          </EmptyState.Description>
        </EmptyState.Content>
      </EmptyState.Root>
    );
  }

  return (
    <>
      <Table>
        {header}
        <CoreObjectTableBody>
          {runs.map((run) => {
            const { color, text } = getWorkflowRunStatusTagProps({
              workflowRunStatus: run.status,
            });
            const openRun = () =>
              openRecordInSidePanel({
                recordId: run.id,
                objectNameSingular: StandardObjectNameSingular.WorkflowRun,
              });
            const durationInMs =
              isDefined(run.startedAt) && isDefined(run.endedAt)
                ? new Date(run.endedAt).getTime() -
                  new Date(run.startedAt).getTime()
                : null;

            return (
              <CoreObjectTableRow
                key={run.id}
                gridTemplateColumns={CORE_WORKFLOW_RUNS_GRID_TEMPLATE_COLUMNS}
                onClick={openRun}
                onKeyDown={handleCoreObjectTableRowKeyDown(openRun)}
                role="button"
                tabIndex={0}
              >
                <TableCell overflow="hidden">{run.name}</TableCell>
                <TableCell>
                  <Tag color={color}>{text}</Tag>
                </TableCell>
                <TableCell color={themeCssVariables.font.color.secondary}>
                  <DateTimeDisplay value={run.startedAt ?? run.createdAt} />
                </TableCell>
                <TableCell
                  align="right"
                  color={themeCssVariables.font.color.secondary}
                >
                  {isDefined(durationInMs) ? formatDuration(durationInMs) : ''}
                </TableCell>
                <TableCell color={themeCssVariables.font.color.secondary}>
                  {isDefined(run.coreWorkflowVersionId)
                    ? versionLabelById.get(run.coreWorkflowVersionId)
                    : ''}
                </TableCell>
              </CoreObjectTableRow>
            );
          })}
        </CoreObjectTableBody>
      </Table>
      {hasNextPage && (
        <CoreObjectTableFetchMoreTrigger
          isFetchingNextPage={loading}
          onFetchNextPage={fetchMoreRuns}
        />
      )}
    </>
  );
};
