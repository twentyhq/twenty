import { type TimelineActivityType } from '@/activities/timeline-activities/types/TimelineActivityType';
import { getTimelineActivityAction } from '@/activities/timeline-activities/utils/getTimelineActivityAction';

const UPDATED_TYPE_ID = '20202020-0000-4000-8000-000000000001';

const timelineActivityTypeById = new Map<string, TimelineActivityType>([
  [
    UPDATED_TYPE_ID,
    {
      id: UPDATED_TYPE_ID,
      name: 'recordUpdated',
      label: 'updated',
      action: 'updated',
      icon: null,
      renderer: null,
      objectUniversalIdentifier: null,
    },
  ],
]);

describe('getTimelineActivityAction', () => {
  it('reads the action from the activity type', () => {
    expect(
      getTimelineActivityAction(
        {
          timelineActivityTypeId: UPDATED_TYPE_ID,
          name: 'company.created',
          properties: {},
        },
        timelineActivityTypeById,
      ),
    ).toBe('updated');
  });

  it('falls back to the deprecated name for a row written by an old pod', () => {
    expect(
      getTimelineActivityAction(
        {
          timelineActivityTypeId: null,
          name: 'company.created',
          properties: {},
        },
        timelineActivityTypeById,
      ),
    ).toBe('created');
  });

  it('returns null when neither representation resolves', () => {
    expect(
      getTimelineActivityAction(
        { timelineActivityTypeId: null, name: null, properties: {} },
        timelineActivityTypeById,
      ),
    ).toBeNull();
  });
});
