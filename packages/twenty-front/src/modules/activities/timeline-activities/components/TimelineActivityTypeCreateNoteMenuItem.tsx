import { TimelineActivityTypeCreateActivityMenuItem } from '@/activities/timeline-activities/components/TimelineActivityTypeCreateActivityMenuItem';
import { type TimelineActivityTypeCreateMenuItemProps } from '@/activities/timeline-activities/types/TimelineActivityTypeCreateMenuItemProps';
import { CoreObjectNameSingular } from 'twenty-shared/types';

type TimelineActivityTypeCreateNoteMenuItemProps =
  TimelineActivityTypeCreateMenuItemProps;

export const TimelineActivityTypeCreateNoteMenuItem = ({
  timelineActivityType,
  onActionStarted,
}: TimelineActivityTypeCreateNoteMenuItemProps) => (
  <TimelineActivityTypeCreateActivityMenuItem
    timelineActivityType={timelineActivityType}
    onActionStarted={onActionStarted}
    activityObjectNameSingular={CoreObjectNameSingular.Note}
  />
);
