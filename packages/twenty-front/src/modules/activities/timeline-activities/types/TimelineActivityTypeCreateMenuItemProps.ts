import { type TimelineActivityType } from '@/activities/timeline-activities/types/TimelineActivityType';

export type TimelineActivityTypeCreateMenuItemProps = {
  timelineActivityType: TimelineActivityType;
  onActionStarted: () => void;
};
