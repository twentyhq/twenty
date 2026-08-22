import { TimelineActivityTypeCreateActivityMenuItem } from '@/activities/timeline-activities/components/TimelineActivityTypeCreateActivityMenuItem';
import { type TimelineActivityTypeCreateMenuItemProps } from '@/activities/timeline-activities/types/TimelineActivityTypeCreateMenuItemProps';
import { CoreObjectNameSingular } from 'twenty-shared/types';

type TimelineActivityTypeCreateTaskMenuItemProps =
  TimelineActivityTypeCreateMenuItemProps;

export const TimelineActivityTypeCreateTaskMenuItem = ({
  timelineActivityType,
  onActionStarted,
}: TimelineActivityTypeCreateTaskMenuItemProps) => (
  <TimelineActivityTypeCreateActivityMenuItem
    timelineActivityType={timelineActivityType}
    onActionStarted={onActionStarted}
    activityObjectNameSingular={CoreObjectNameSingular.Task}
  />
);
