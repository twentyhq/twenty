import { TimelineActivity } from '@/activities/timelineActivities/types/TimelineActivity';
import { TimelineActivityLinkedObject } from '@/activities/timelineActivities/types/TimelineActivityLinkedObject';

export const filterTimelineActivityByLinkedObjectTypes =
  (linkedObjectTypes: TimelineActivityLinkedObject[]) =>
  (timelineActivity: TimelineActivity) => {
    return linkedObjectTypes.some((linkedObjectType) => {
      const linkedObjectPartInName = timelineActivity.name.split('.')[0];

      return linkedObjectPartInName.includes(linkedObjectType);
    });
  };
