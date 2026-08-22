import { TimelineActivityTypeCreateNoteMenuItem } from '@/activities/timeline-activities/components/TimelineActivityTypeCreateNoteMenuItem';
import { TimelineActivityTypeCreateTaskMenuItem } from '@/activities/timeline-activities/components/TimelineActivityTypeCreateTaskMenuItem';
import { type TimelineActivityTypeCreateMenuItemProps } from '@/activities/timeline-activities/types/TimelineActivityTypeCreateMenuItemProps';
import { type ComponentType } from 'react';

// Keyed by timelineActivityType.name: a type is creatable from the timeline
// only if it registers here, and the entry owns both the label source and the
// side panel it opens.
export const TIMELINE_ACTIVITY_TYPE_CREATE_MENU_ITEM_BY_NAME: Partial<
  Record<string, ComponentType<TimelineActivityTypeCreateMenuItemProps>>
> = {
  note: TimelineActivityTypeCreateNoteMenuItem,
  task: TimelineActivityTypeCreateTaskMenuItem,
};
