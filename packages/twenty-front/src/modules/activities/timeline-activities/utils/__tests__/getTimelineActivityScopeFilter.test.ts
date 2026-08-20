import { getTimelineActivityScopeFilter } from '@/activities/timeline-activities/utils/getTimelineActivityScopeFilter';
import { TIMELINE_ACTIVITY_ACTIONS } from 'twenty-shared/timeline';

describe('getTimelineActivityScopeFilter', () => {
  it('should not constrain the query when the scope is all', () => {
    expect(getTimelineActivityScopeFilter('all')).toEqual({});
  });

  it('should keep only link events when the scope is activity', () => {
    expect(getTimelineActivityScopeFilter('activity')).toEqual({
      action: { in: ['linked', 'unlinked'] },
    });
  });

  it('should keep only record changes when the scope is history', () => {
    expect(getTimelineActivityScopeFilter('history')).toEqual({
      action: { in: ['created', 'updated', 'deleted', 'restored'] },
    });
  });

  it('should account for every known action across the two scopes exactly once', () => {
    const scopedActions = [
      ...(getTimelineActivityScopeFilter('activity').action?.in ?? []),
      ...(getTimelineActivityScopeFilter('history').action?.in ?? []),
    ];

    expect(scopedActions.toSorted()).toEqual(
      TIMELINE_ACTIVITY_ACTIONS.toSorted(),
    );
  });
});
