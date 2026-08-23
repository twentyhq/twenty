import { getUpdatedTimelineActivityTypeFilter } from '@/activities/timeline-activities/utils/getUpdatedTimelineActivityTypeFilter';

const allTimelineActivityTypeUniversalIdentifiers = [
  'attached-file',
  'linked-record',
  'sent-email',
];

describe('getUpdatedTimelineActivityTypeFilter', () => {
  it('hides one type when an empty filter represents all visible types', () => {
    expect(
      getUpdatedTimelineActivityTypeFilter({
        allTimelineActivityTypeUniversalIdentifiers,
        currentFilter: [],
        timelineActivityTypeUniversalIdentifier: 'linked-record',
        isVisible: false,
      }),
    ).toEqual(['attached-file', 'sent-email']);
  });

  it('adds a type to an existing visibility filter', () => {
    expect(
      getUpdatedTimelineActivityTypeFilter({
        allTimelineActivityTypeUniversalIdentifiers,
        currentFilter: ['attached-file'],
        timelineActivityTypeUniversalIdentifier: 'linked-record',
        isVisible: true,
      }),
    ).toEqual(['attached-file', 'linked-record']);
  });

  it('normalizes a fully visible selection back to an empty filter', () => {
    expect(
      getUpdatedTimelineActivityTypeFilter({
        allTimelineActivityTypeUniversalIdentifiers,
        currentFilter: ['attached-file', 'linked-record'],
        timelineActivityTypeUniversalIdentifier: 'sent-email',
        isVisible: true,
      }),
    ).toEqual([]);
  });

  it('keeps the last visible type enabled', () => {
    expect(
      getUpdatedTimelineActivityTypeFilter({
        allTimelineActivityTypeUniversalIdentifiers,
        currentFilter: ['linked-record'],
        timelineActivityTypeUniversalIdentifier: 'linked-record',
        isVisible: false,
      }),
    ).toEqual(['linked-record']);
  });
});
