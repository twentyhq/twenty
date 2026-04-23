import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';
import { type TimelineActivityLinkedObject } from '@/activities/timeline-activities/types/TimelineActivityLinkedObject';

export const filterTimelineActivityByLinkedObjectTypes =
  (linkedObjectTypes: TimelineActivityLinkedObject[]) =>
  (timelineActivity: TimelineActivity) => {
    return linkedObjectTypes.some((linkedObjectType) => {
      const linkedObjectPartInName = timelineActivity.name.split('.')[0];

      return linkedObjectPartInName.includes(linkedObjectType);
    });
  };
