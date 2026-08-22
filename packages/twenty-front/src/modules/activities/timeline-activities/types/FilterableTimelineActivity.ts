import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';

// The read-time filters and the action lookup touch these fields only, so they
// take this rather than a whole activity and force casts on every fixture. Both
// nullable fields are optional because every reader guards them with isDefined.
export type FilterableTimelineActivity = Pick<TimelineActivity, 'properties'> &
  Partial<
    Pick<
      TimelineActivity,
      'linkedObjectMetadataId' | 'name' | 'timelineActivityTypeId'
    >
  >;
