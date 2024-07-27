import { CalendarEventParticipant } from '@/activities/calendar/types/CalendarEventParticipant';
import { CalendarChannelVisibility } from '~/generated/graphql';

// TODO: use backend CalendarEvent type when ready
export type CalendarEvent = {
  conferenceLink?: {
    primaryLinkLabel: string;
    primaryLinkUrl: string;
  };
  description?: string;
  endsAt?: string;
  externalCreatedAt: string;
  id: string;
  isCanceled?: boolean;
  isFullDay: boolean;
  location?: string;
  startsAt: string;
  title?: string;
  visibility: CalendarChannelVisibility;
  calendarEventParticipants?: CalendarEventParticipant[];
  __typename: 'CalendarEvent';
};
