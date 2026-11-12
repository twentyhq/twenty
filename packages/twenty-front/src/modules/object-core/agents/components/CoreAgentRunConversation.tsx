import { plural } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { useOpenAskAiThread } from '@/ai/hooks/useOpenAskAiThread';
import { CoreAgentRunStatus } from '@/object-core/agents/components/CoreAgentRunStatus';
import { CORE_AGENT_RUNS_GRID_TEMPLATE_COLUMNS } from '@/object-core/agents/constants/CoreAgentRunsGridTemplateColumns';
import { type CoreAgentRun } from '@/object-core/agents/types/CoreAgentRun';
import { handleCoreObjectTableRowKeyDown } from '@/object-core/utils/handleCoreObjectTableRowKeyDown';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';
import { formatNumber } from '@/localization/utils/formatNumber';

type CoreAgentRunConversationProps = {
  threadId: string;
  title: string | null;
  runs: CoreAgentRun[];
};

export const CoreAgentRunConversation = ({
  threadId,
  title,
  runs,
}: CoreAgentRunConversationProps) => {
  const { openAskAiThread } = useOpenAskAiThread();
  const [latestRun] = runs;
  const openConversation = () => openAskAiThread(threadId);
  // a total missing some runs' usage would read as the whole conversation's cost
  const hasCreditsForEveryRun = runs.every((run) => isDefined(run.credits));
  const totalCredits = runs.reduce(
    (credits, run) => credits + (run.credits ?? 0),
    0,
  );
  const runCount = runs.length;

  return (
    <TableRow
      gridTemplateColumns={CORE_AGENT_RUNS_GRID_TEMPLATE_COLUMNS}
      onClick={openConversation}
      onKeyDown={handleCoreObjectTableRowKeyDown(openConversation)}
      role="button"
      tabIndex={0}
    >
      <TableCell>
        <CoreAgentRunStatus status={latestRun.status} />
      </TableCell>
      <TableCell color={themeCssVariables.font.color.tertiary}>
        {beautifyPastDateRelativeToNow(
          latestRun.startedAt ?? latestRun.createdAt,
        )}
      </TableCell>
      <TableCell color={themeCssVariables.font.color.secondary}>
        {plural(runCount, { one: '# turn', other: '# turns' })}
      </TableCell>
      <TableCell overflow="hidden">
        <OverflowingTextWithTooltip
          text={<>{title ?? latestRun.input}</>}
          tooltipContent={title ?? latestRun.input ?? ''}
        />
      </TableCell>
      <TableCell />
      <TableCell align="right" color={themeCssVariables.font.color.secondary}>
        {hasCreditsForEveryRun
          ? formatNumber(totalCredits, { decimals: 2 })
          : '-'}
      </TableCell>
      <TableCell />
    </TableRow>
  );
};
