import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { CoreAgentRunDetails } from '@/object-core/agents/components/CoreAgentRunDetails';
import { CoreAgentRunSource } from '@/object-core/agents/components/CoreAgentRunSource';
import { CoreAgentRunStatus } from '@/object-core/agents/components/CoreAgentRunStatus';
import { CORE_AGENT_RUNS_GRID_TEMPLATE_COLUMNS } from '@/object-core/agents/constants/CoreAgentRunsGridTemplateColumns';
import { type CoreAgentRun } from '@/object-core/agents/types/CoreAgentRun';
import { handleCoreAgentRunToggleKeyDown } from '@/object-core/agents/utils/handleCoreAgentRunToggleKeyDown';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { formatDuration } from '@/workflow/workflow-steps/workflow-actions/utils/formatDuration';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';
import { formatNumber } from '~/utils/format/formatNumber';

type CoreAgentRunRowProps = {
  run: CoreAgentRun;
  isExpanded: boolean;
  onToggle: () => void;
  isNested?: boolean;
};

const getRunTokens = (run: CoreAgentRun): number | null =>
  isDefined(run.inputTokens) || isDefined(run.outputTokens)
    ? (run.inputTokens ?? 0) + (run.outputTokens ?? 0)
    : null;

const getRunDurationMs = (run: CoreAgentRun): number | null =>
  isDefined(run.startedAt) && isDefined(run.endedAt)
    ? new Date(run.endedAt).getTime() - new Date(run.startedAt).getTime()
    : null;

export const CoreAgentRunRow = ({
  run,
  isExpanded,
  onToggle,
  isNested = false,
}: CoreAgentRunRowProps) => {
  const tokens = getRunTokens(run);
  const durationMs = getRunDurationMs(run);

  return (
    <>
      <TableRow
        gridTemplateColumns={CORE_AGENT_RUNS_GRID_TEMPLATE_COLUMNS}
        isExpanded={isExpanded}
        onClick={onToggle}
        onKeyDown={handleCoreAgentRunToggleKeyDown(onToggle)}
        role="button"
        tabIndex={0}
        ariaExpanded={isExpanded}
      >
        <TableCell
          padding={
            isNested ? `0 0 0 ${themeCssVariables.spacing[4]}` : undefined
          }
        >
          <CoreAgentRunStatus status={run.status} />
        </TableCell>
        <TableCell color={themeCssVariables.font.color.tertiary}>
          {beautifyPastDateRelativeToNow(run.startedAt ?? run.createdAt)}
        </TableCell>
        <TableCell overflow="hidden">
          <CoreAgentRunSource
            creatorSource={run.creatorSource}
            creatorName={run.creatorName}
          />
        </TableCell>
        <TableCell overflow="hidden">
          {/* plain text: links would sit inside the row's button */}
          <OverflowingTextWithTooltip
            text={<>{run.input ?? t`No input`}</>}
            tooltipContent={run.input ?? t`No input`}
          />
        </TableCell>
        <TableCell align="right" color={themeCssVariables.font.color.secondary}>
          {isDefined(tokens) ? formatNumber(tokens, { abbreviate: true }) : '-'}
        </TableCell>
        <TableCell align="right" color={themeCssVariables.font.color.secondary}>
          {isDefined(run.credits)
            ? formatNumber(run.credits, { decimals: 2 })
            : '-'}
        </TableCell>
        <TableCell align="right" color={themeCssVariables.font.color.secondary}>
          {isDefined(durationMs) ? formatDuration(durationMs) : '-'}
        </TableCell>
      </TableRow>
      {isExpanded && <CoreAgentRunDetails run={run} />}
    </>
  );
};
