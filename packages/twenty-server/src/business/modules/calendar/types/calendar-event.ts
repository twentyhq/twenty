import { CalendarEventAttendeeObjectMetadata } from 'src/business/modules/calendar/calendar-event-attendee.object-metadata';
import { CalendarEventObjectMetadata } from 'src/business/modules/calendar/calendar-event.object-metadata';
import { ObjectRecord } from 'src/engine/workspace-manager/workspace-sync-metadata/types/object-record';

export type CalendarEvent = Omit<
  ObjectRecord<CalendarEventObjectMetadata>,
  | 'createdAt'
  | 'updatedAt'
  | 'calendarChannelEventAssociations'
  | 'calendarEventAttendees'
  | 'eventAttendees'
>;

export type CalendarEventAttendee = Omit<
  ObjectRecord<CalendarEventAttendeeObjectMetadata>,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'personId'
  | 'workspaceMemberId'
  | 'person'
  | 'workspaceMember'
  | 'calendarEvent'
> & {
  iCalUID: string;
};

export type CalendarEventWithAttendees = CalendarEvent & {
  externalId: string;
  attendees: CalendarEventAttendee[];
};
