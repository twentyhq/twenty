import { getTimelineActivityScopeFilter } from '@/activities/timeline-activities/utils/getTimelineActivityScopeFilter';

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

  it('should split every action across the two scopes without overlap', () => {
    const activityActions =
      getTimelineActivityScopeFilter('activity').action?.in ?? [];
    const historyActions =
      getTimelineActivityScopeFilter('history').action?.in ?? [];

    expect(
      activityActions.filter((action) => historyActions.includes(action)),
    ).toEqual([]);
  });
});
