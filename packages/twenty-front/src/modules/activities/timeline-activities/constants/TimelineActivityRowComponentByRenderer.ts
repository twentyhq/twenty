import { EventRowActivity } from '@/activities/timeline-activities/rows/activity/components/EventRowActivity';
import { EventRowCalendarEvent } from '@/activities/timeline-activities/rows/calendar/components/EventRowCalendarEvent';
import { type EventRowDynamicComponentProps } from '@/activities/timeline-activities/rows/components/EventRowDynamicComponent.types';
import { EventRowGenericLinked } from '@/activities/timeline-activities/rows/generic/components/EventRowGenericLinked';
import { EventRowMainObject } from '@/activities/timeline-activities/rows/main-object/components/EventRowMainObject';
import { EventRowMessage } from '@/activities/timeline-activities/rows/message/components/EventRowMessage';
import { type ComponentType } from 'react';
import { type TimelineActivityRenderer } from 'twenty-shared/timeline';

// The one place a renderer name becomes a component. A timeline activity type
// names its renderer, so adding a row shape is adding an entry here and a type
// declaring it, never a new branch at the call site.
export const TIMELINE_ACTIVITY_ROW_COMPONENT_BY_RENDERER: Record<
  TimelineActivityRenderer,
  ComponentType<EventRowDynamicComponentProps>
> = {
  mainObject: EventRowMainObject,
  genericLinked: EventRowGenericLinked,
  activity: EventRowActivity,
  message: EventRowMessage,
  calendarEvent: EventRowCalendarEvent,
};
