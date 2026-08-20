import { type TimelineActivityScope } from '@/activities/timeline-activities/types/TimelineActivityScope';
import { type TimelineActivityAction } from 'twenty-shared/timeline';

export type TimelineActivityScopeFilter = {
  action?: { in: TimelineActivityAction[] };
};

const SCOPE_ACTIONS: Record<
  Exclude<TimelineActivityScope, 'all'>,
  TimelineActivityAction[]
> = {
  activity: ['linked', 'unlinked'],
  history: ['created', 'updated', 'deleted', 'restored'],
};

// Filtering runs in SQL on the action column, so it cannot apply the name
// fallback the read path uses. Rows written before the column existed and left
// unbackfilled carry no action and only appear under the unfiltered scope.
export const getTimelineActivityScopeFilter = (
  scope: TimelineActivityScope,
): TimelineActivityScopeFilter =>
  scope === 'all' ? {} : { action: { in: SCOPE_ACTIONS[scope] } };
