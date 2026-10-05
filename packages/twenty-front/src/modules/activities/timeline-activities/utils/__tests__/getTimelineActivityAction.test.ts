import { type TimelineActivityTypeMaps } from '@/activities/timeline-activities/types/TimelineActivityTypeMaps';
import { getTimelineActivityAction } from '@/activities/timeline-activities/utils/getTimelineActivityAction';

const UPDATED_TYPE_ID = '20202020-0000-4000-8000-000000000001';

const timelineActivityTypeMaps: TimelineActivityTypeMaps = {
  byId: new Map([
    [
      UPDATED_TYPE_ID,
      {
        id: UPDATED_TYPE_ID,
        universalIdentifier: UPDATED_TYPE_ID,
        name: 'recordUpdated',
        label: 'updated',
        action: 'updated',
        icon: null,
        objectUniversalIdentifier: null,
        frontComponentUniversalIdentifier: null,
      },
    ],
  ]),
  byUniversalIdentifier: new Map(),
};

describe('getTimelineActivityAction', () => {
  it('reads the action from the activity type', () => {
    expect(
      getTimelineActivityAction(
        {
          timelineActivityTypeId: UPDATED_TYPE_ID,
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

  it('falls back to the legacy name for a row written during a rolling upgrade', () => {
    expect(
      getTimelineActivityAction(
        { name: 'company.updated', properties: {} },
        timelineActivityTypeMaps,
      ),
    ).toBe('updated');
  });
});
