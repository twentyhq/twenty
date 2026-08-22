import { getTimelineActivityRenderer } from '@/activities/timeline-activities/utils/getTimelineActivityRenderer';

describe('getTimelineActivityRenderer', () => {
  it('uses the renderer resolved from the activity type', () => {
    expect(
      getTimelineActivityRenderer({
        eventRenderer: 'calendarEvent',
        legacyName: 'linked-note.updated',
        linkedObjectNameSingular: 'note',
      }),
    ).toBe('calendarEvent');
  });

  it.each([
    ['note', 'activity'],
    ['task', 'activity'],
    ['message', 'message'],
    ['calendarEvent', 'calendarEvent'],
  ] as const)(
    'preserves the legacy %s renderer when the type no longer resolves',
    (linkedObjectNameSingular, expectedRenderer) => {
      expect(
        getTimelineActivityRenderer({
          eventRenderer: null,
          legacyName: `linked-${linkedObjectNameSingular}.updated`,
          linkedObjectNameSingular,
        }),
      ).toBe(expectedRenderer);
    },
  );

  it('uses the generic renderer for a type-only linked row', () => {
    expect(
      getTimelineActivityRenderer({
        eventRenderer: null,
        legacyName: null,
        linkedObjectNameSingular: 'customObject',
      }),
    ).toBe('genericLinked');
  });

  it('uses the main object renderer for a type-only unlinked row', () => {
    expect(
      getTimelineActivityRenderer({
        eventRenderer: null,
        legacyName: null,
        linkedObjectNameSingular: undefined,
      }),
    ).toBe('mainObject');
  });
});
