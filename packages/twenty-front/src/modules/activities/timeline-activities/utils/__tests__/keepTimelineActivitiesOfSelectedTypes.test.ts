import { type FilterableTimelineActivity } from '@/activities/timeline-activities/types/FilterableTimelineActivity';
import { keepTimelineActivitiesOfSelectedTypes } from '@/activities/timeline-activities/utils/keepTimelineActivitiesOfSelectedTypes';

const UPDATED_TYPE_ID = '20202020-0000-4000-8000-0000000update';
const LINKED_TYPE_ID = '20202020-0000-4000-8000-0000000linked';

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

    expect(keepTimelineActivitiesOfSelectedTypes(activities, [])).toEqual(
      activities,
    );
  });

  it('keeps only the activities carrying a selected type', () => {
    expect(
      keepTimelineActivitiesOfSelectedTypes(
        [updatedActivity, linkedActivity, untypedActivity],
        [LINKED_TYPE_ID],
      ),
    ).toEqual([linkedActivity]);
  });

  it('keeps activities across several selected types', () => {
    expect(
      keepTimelineActivitiesOfSelectedTypes(
        [updatedActivity, linkedActivity, untypedActivity],
        [LINKED_TYPE_ID, UPDATED_TYPE_ID],
      ),
    ).toEqual([updatedActivity, linkedActivity]);
  });

  it('drops activities with no type when a selection is active', () => {
    expect(
      keepTimelineActivitiesOfSelectedTypes(
        [untypedActivity],
        [UPDATED_TYPE_ID],
      ),
    ).toEqual([]);
  });
});
