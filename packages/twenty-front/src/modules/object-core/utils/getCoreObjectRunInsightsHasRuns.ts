import { isDefined } from 'twenty-shared/utils';

// Undefined until the first response, so the default tab is never picked from nothing
export const getCoreObjectRunInsightsHasRuns = ({
  isLoading,
  runCount,
}: {
  isLoading: boolean;
  runCount: number | undefined;
}): boolean | undefined =>
  isLoading && !isDefined(runCount) ? undefined : (runCount ?? 0) > 0;
