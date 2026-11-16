import { RUN_INSIGHTS_WINDOW_IN_DAYS } from 'src/engine/utils/run-insights/run-insights-window-in-days.constant';

export const buildCoreWorkflowRunCountWindowPredicate = (
  createdAtColumn: string,
) => ({
  predicate: `${createdAtColumn} >= NOW() - MAKE_INTERVAL(days => :runCountWindowInDays)`,
  parameters: { runCountWindowInDays: RUN_INSIGHTS_WINDOW_IN_DAYS },
});
