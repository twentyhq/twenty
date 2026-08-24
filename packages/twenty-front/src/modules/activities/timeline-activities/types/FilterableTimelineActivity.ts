import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';

export type FilterableTimelineActivity = Pick<TimelineActivity, 'properties'> &
  Partial<
    Pick<
      TimelineActivity,
      | 'name'
      | 'linkedObjectMetadataId'
      | 'timelineActivityTypeId'
      | 'timelineActivityTypeSnapshot'
    >
  >;
