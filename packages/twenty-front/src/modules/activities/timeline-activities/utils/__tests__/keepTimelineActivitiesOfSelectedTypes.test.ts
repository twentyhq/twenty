import { type FilterableTimelineActivity } from '@/activities/timeline-activities/types/FilterableTimelineActivity';
import { type TimelineActivityType } from '@/activities/timeline-activities/types/TimelineActivityType';
import { type TimelineActivityTypeMaps } from '@/activities/timeline-activities/types/TimelineActivityTypeMaps';
import { keepTimelineActivitiesOfSelectedTypes } from '@/activities/timeline-activities/utils/keepTimelineActivitiesOfSelectedTypes';

const UPDATED_TYPE_ID = '20202020-0000-4000-8000-0000000update';
const LINKED_TYPE_ID = '20202020-0000-4000-8000-0000000linked';

const buildTimelineActivityType = (id: string): TimelineActivityType => ({
  id,
  universalIdentifier: id,
  name: id,
  label: id,
  action: 'updated',
  icon: null,
  objectUniversalIdentifier: null,
  frontComponentUniversalIdentifier: null,
});

const timelineActivityTypeMaps: TimelineActivityTypeMaps = {
  byId: new Map([
    [UPDATED_TYPE_ID, buildTimelineActivityType(UPDATED_TYPE_ID)],
    [LINKED_TYPE_ID, buildTimelineActivityType(LINKED_TYPE_ID)],
  ]),
  byUniversalIdentifier: new Map(),
};

const updatedActivity = {
  timelineActivityTypeId: UPDATED_TYPE_ID,
  properties: {},
} satisfies FilterableTimelineActivity;

const linkedActivity = {
  timelineActivityTypeId: LINKED_TYPE_ID,
  properties: {},
} satisfies FilterableTimelineActivity;

const untypedActivity = { properties: {} } satisfies FilterableTimelineActivity;

describe('keepTimelineActivitiesOfSelectedTypes', () => {
  it('keeps everything when nothing is selected', () => {
    const activities = [updatedActivity, linkedActivity, untypedActivity];

    expect(
      keepTimelineActivitiesOfSelectedTypes(
        activities,
        [],
        timelineActivityTypeMaps,
      ),
    ).toEqual(activities);
  });

  it('keeps only the activities carrying a selected type', () => {
    expect(
      keepTimelineActivitiesOfSelectedTypes(
        [updatedActivity, linkedActivity, untypedActivity],
        [LINKED_TYPE_ID],
        timelineActivityTypeMaps,
      ),
    ).toEqual([linkedActivity]);
  });

  it('keeps activities across several selected types', () => {
    expect(
      keepTimelineActivitiesOfSelectedTypes(
        [updatedActivity, linkedActivity, untypedActivity],
        [LINKED_TYPE_ID, UPDATED_TYPE_ID],
        timelineActivityTypeMaps,
      ),
    ).toEqual([updatedActivity, linkedActivity]);
  });

  it('drops activities with no type when a selection is active', () => {
    expect(
      keepTimelineActivitiesOfSelectedTypes(
        [untypedActivity],
        [UPDATED_TYPE_ID],
        timelineActivityTypeMaps,
      ),
    ).toEqual([]);
  });

  it('matches historical activities after a type reinstall', () => {
    const reinstalledType = {
      ...buildTimelineActivityType('new-installation-id'),
      universalIdentifier: UPDATED_TYPE_ID,
    };
    const historicalActivity = {
      timelineActivityTypeId: UPDATED_TYPE_ID,
      timelineActivityTypeSnapshot: buildTimelineActivityType(UPDATED_TYPE_ID),
      properties: {},
    } satisfies FilterableTimelineActivity;

    expect(
      keepTimelineActivitiesOfSelectedTypes(
        [historicalActivity],
        [reinstalledType.universalIdentifier],
        {
          byId: new Map([[reinstalledType.id, reinstalledType]]),
          byUniversalIdentifier: new Map([
            [reinstalledType.universalIdentifier, reinstalledType],
          ]),
        },
      ),
    ).toEqual([historicalActivity]);
  });
});
