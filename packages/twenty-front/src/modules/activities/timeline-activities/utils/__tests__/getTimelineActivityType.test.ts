import { type FilterableTimelineActivity } from '@/activities/timeline-activities/types/FilterableTimelineActivity';
import { type TimelineActivityType } from '@/activities/timeline-activities/types/TimelineActivityType';
import { type TimelineActivityTypeMaps } from '@/activities/timeline-activities/types/TimelineActivityTypeMaps';
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

const getMaps = (
  timelineActivityTypes: TimelineActivityType[],
): TimelineActivityTypeMaps => ({
  byId: new Map(
    timelineActivityTypes.map((timelineActivityType) => [
      timelineActivityType.id,
      timelineActivityType,
    ]),
  ),
  byUniversalIdentifier: new Map(
    timelineActivityTypes.map((timelineActivityType) => [
      timelineActivityType.universalIdentifier,
      timelineActivityType,
    ]),
  ),
});

describe('getTimelineActivityType', () => {
  it('uses snapshot semantics with live presentation', () => {
    expect(
      getTimelineActivityType(
        timelineActivity,
        getMaps([liveTimelineActivityType]),
      ),
    ).toEqual({
      ...timelineActivity.timelineActivityTypeSnapshot,
      id: liveTimelineActivityType.id,
      name: liveTimelineActivityType.name,
      label: liveTimelineActivityType.label,
      icon: liveTimelineActivityType.icon,
      frontComponentUniversalIdentifier:
        liveTimelineActivityType.frontComponentUniversalIdentifier,
    });
  });

  it('keeps rendering after the provider application is uninstalled', () => {
    expect(getTimelineActivityType(timelineActivity, getMaps([]))).toEqual(
      timelineActivity.timelineActivityTypeSnapshot,
    );
  });

  it('finds live presentation after the application is reinstalled', () => {
    const reinstalledTimelineActivityType = {
      ...liveTimelineActivityType,
      id: '00000000-0000-4000-8000-000000000004',
    };

    expect(
      getTimelineActivityType(
        timelineActivity,
        getMaps([reinstalledTimelineActivityType]),
      ),
    ).toMatchObject({
      id: reinstalledTimelineActivityType.id,
      label: liveTimelineActivityType.label,
      icon: liveTimelineActivityType.icon,
      action: timelineActivity.timelineActivityTypeSnapshot.action,
    });
  });

  it('reads live metadata for pre-snapshot typed rows', () => {
    expect(
      getTimelineActivityType(
        {
          properties: {},
          timelineActivityTypeId: TIMELINE_ACTIVITY_TYPE_ID,
        },
        getMaps([liveTimelineActivityType]),
      ),
    ).toBe(liveTimelineActivityType);
  });
});
