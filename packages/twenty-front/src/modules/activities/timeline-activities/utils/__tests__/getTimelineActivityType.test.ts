import { type FilterableTimelineActivity } from '@/activities/timeline-activities/types/FilterableTimelineActivity';
import { type TimelineActivityType } from '@/activities/timeline-activities/types/TimelineActivityType';
import { getTimelineActivityType } from '@/activities/timeline-activities/utils/getTimelineActivityType';

const TIMELINE_ACTIVITY_TYPE_ID = '00000000-0000-4000-8000-000000000001';
const TIMELINE_ACTIVITY_TYPE_UNIVERSAL_IDENTIFIER =
  '00000000-0000-4000-8000-000000000002';
const FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  '00000000-0000-4000-8000-000000000003';

const liveTimelineActivityType: TimelineActivityType = {
  id: TIMELINE_ACTIVITY_TYPE_ID,
  universalIdentifier: TIMELINE_ACTIVITY_TYPE_UNIVERSAL_IDENTIFIER,
  name: 'deploymentCompleted',
  label: 'completed a deployment',
  action: 'updated',
  icon: 'IconRocket',
  objectUniversalIdentifier: null,
  frontComponentUniversalIdentifier: null,
};

const timelineActivity = {
  properties: {},
  timelineActivityTypeId: TIMELINE_ACTIVITY_TYPE_ID,
  timelineActivityTypeSnapshot: {
    id: TIMELINE_ACTIVITY_TYPE_ID,
    universalIdentifier: TIMELINE_ACTIVITY_TYPE_UNIVERSAL_IDENTIFIER,
    name: 'deploymentStarted',
    label: 'started a deployment',
    action: 'created',
    icon: 'IconPlayerPlay',
    objectUniversalIdentifier: null,
    frontComponentUniversalIdentifier: FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  },
} satisfies FilterableTimelineActivity;

describe('getTimelineActivityType', () => {
  it('uses snapshot semantics with the translated live label', () => {
    expect(
      getTimelineActivityType(
        timelineActivity,
        new Map([[TIMELINE_ACTIVITY_TYPE_ID, liveTimelineActivityType]]),
      ),
    ).toEqual({
      ...timelineActivity.timelineActivityTypeSnapshot,
      label: liveTimelineActivityType.label,
    });
  });

  it('keeps rendering after the provider application is uninstalled', () => {
    expect(getTimelineActivityType(timelineActivity, new Map())).toEqual(
      timelineActivity.timelineActivityTypeSnapshot,
    );
  });

  it('reads live metadata for pre-snapshot typed rows', () => {
    expect(
      getTimelineActivityType(
        {
          properties: {},
          timelineActivityTypeId: TIMELINE_ACTIVITY_TYPE_ID,
        },
        new Map([[TIMELINE_ACTIVITY_TYPE_ID, liveTimelineActivityType]]),
      ),
    ).toBe(liveTimelineActivityType);
  });
});
