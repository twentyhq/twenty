import { CORE_WORKFLOW_RUN_COUNT_WINDOW_IN_DAYS } from 'src/engine/core-modules/workflow/constants/core-workflow-run-count-window-in-days.constant';

export const buildCoreWorkflowRunCountWindowPredicate = (
  createdAtColumn: string,
) => ({
  predicate: `${createdAtColumn} >= NOW() - MAKE_INTERVAL(days => :runCountWindowInDays)`,
  parameters: { runCountWindowInDays: CORE_WORKFLOW_RUN_COUNT_WINDOW_IN_DAYS },
});
