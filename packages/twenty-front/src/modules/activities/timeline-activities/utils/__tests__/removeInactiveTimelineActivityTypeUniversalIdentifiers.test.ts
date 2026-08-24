import { removeInactiveTimelineActivityTypeUniversalIdentifiers } from '@/activities/timeline-activities/utils/removeInactiveTimelineActivityTypeUniversalIdentifiers';

describe('removeInactiveTimelineActivityTypeUniversalIdentifiers', () => {
  it('removes selected types that are no longer active', () => {
    expect(
      removeInactiveTimelineActivityTypeUniversalIdentifiers({
        activeUniversalIdentifiers: ['active-type', 'other-active-type'],
        selectedUniversalIdentifiers: ['active-type', 'inactive-type'],
      }),
    ).toEqual(['active-type']);
  });
});
