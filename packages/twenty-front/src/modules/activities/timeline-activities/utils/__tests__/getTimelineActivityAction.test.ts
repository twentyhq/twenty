import { type TimelineActivityTypeMaps } from '@/activities/timeline-activities/types/TimelineActivityTypeMaps';
import { getTimelineActivityAction } from '@/activities/timeline-activities/utils/getTimelineActivityAction';

const UPDATED_TYPE_ID = '20202020-0000-4000-8000-000000000001';

const updatedType = {
  id: UPDATED_TYPE_ID,
  universalIdentifier: UPDATED_TYPE_ID,
  name: 'recordUpdated',
  label: 'updated',
  action: 'updated' as const,
  icon: null,
  objectUniversalIdentifier: null,
  frontComponentUniversalIdentifier: null,
};

const timelineActivityTypeMaps: TimelineActivityTypeMaps = {
  byId: new Map([[UPDATED_TYPE_ID, updatedType]]),
  byUniversalIdentifier: new Map([[UPDATED_TYPE_ID, updatedType]]),
};

describe('getTimelineActivityAction', () => {
  it('reads the action from the activity type', () => {
    expect(
      getTimelineActivityAction(
        {
          timelineActivityTypeId: UPDATED_TYPE_ID,
          timelineActivityTypeSnapshot: updatedType,
          properties: {},
        },
        timelineActivityTypeMaps,
      ),
    ).toBe('updated');
  });

  it('returns null when the type does not resolve', () => {
    expect(
      getTimelineActivityAction(
        { timelineActivityTypeId: 'missing', properties: {} },
        timelineActivityTypeMaps,
      ),
    ).toBeNull();
  });

  it('does not infer an action without a type snapshot', () => {
    expect(
      getTimelineActivityAction({ properties: {} }, timelineActivityTypeMaps),
    ).toBeNull();
  });
});
