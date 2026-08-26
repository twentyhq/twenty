import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';

export type FilterableTimelineActivity = Pick<TimelineActivity, 'properties'> &
  Partial<
    Pick<
      TimelineActivity,
      | 'linkedObjectMetadataId'
      | 'timelineActivityTypeId'
      | 'timelineActivityTypeSnapshot'
    >
  > & {
    name?: string | null;
  };
