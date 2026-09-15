import { getActiveTimelineActivityTypeUniversalIdentifiersFilter } from '@/activities/timeline-activities/utils/getActiveTimelineActivityTypeUniversalIdentifiersFilter';

describe('getActiveTimelineActivityTypeUniversalIdentifiersFilter', () => {
  it('returns null when no filter is selected', () => {
    expect(
      getActiveTimelineActivityTypeUniversalIdentifiersFilter({
        activeUniversalIdentifiers: ['active-type'],
        selectedUniversalIdentifiers: [],
      }),
    ).toBeNull();
  });

  it('removes selected types that are no longer active', () => {
    expect(
      getActiveTimelineActivityTypeUniversalIdentifiersFilter({
        activeUniversalIdentifiers: ['active-type', 'other-active-type'],
        selectedUniversalIdentifiers: ['active-type', 'inactive-type'],
      }),
    ).toEqual(['active-type']);
  });

  it('preserves an active filter that no longer matches any active type', () => {
    expect(
      getActiveTimelineActivityTypeUniversalIdentifiersFilter({
        activeUniversalIdentifiers: ['active-type'],
        selectedUniversalIdentifiers: ['inactive-type'],
      }),
    ).toEqual([]);
  });
});
