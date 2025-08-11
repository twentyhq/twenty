import { addDays, subHours, subMonths } from 'date-fns';

import { type CalendarEvent } from '@/activities/calendar/types/CalendarEvent';
import { CalendarChannelVisibility } from '~/generated/graphql';

export const mockedCalendarEvents: CalendarEvent[] = [
  {
    externalCreatedAt: new Date().toISOString(),
    endsAt: addDays(new Date().setHours(11, 30), 1).toISOString(),
    id: '9a6b35f1-6078-415b-9540-f62671bb81d0',
    isFullDay: false,
    startsAt: addDays(new Date().setHours(10, 0), 1).toISOString(),
    visibility: CalendarChannelVisibility.METADATA,
    calendarEventParticipants: [
      {
        id: '1',
        handle: 'jdoe',
        isOrganizer: false,
        responseStatus: 'ACCEPTED',
        displayName: 'John Doe',
      },
      {
        id: '2',
        handle: 'jadoe',
        isOrganizer: false,
        responseStatus: 'ACCEPTED',
        displayName: 'Jane Doe',
      },
      {
        id: '3',
        handle: 'tapple',
        isOrganizer: false,
        responseStatus: 'ACCEPTED',
        displayName: 'Tim Apple',
      },
    ],
    __typename: 'CalendarEvent',
  },
  {
    externalCreatedAt: subHours(new Date(), 2).toISOString(),
    id: '19b32878-a950-4968-9e3b-ce5da514ea41',
    endsAt: new Date(new Date().setHours(18, 40)).toISOString(),
    isCanceled: true,
    isFullDay: false,
    startsAt: new Date(new Date().setHours(18, 0)).toISOString(),
    title: 'Bug solving',
    visibility: CalendarChannelVisibility.SHARE_EVERYTHING,
    __typename: 'CalendarEvent',
  },
  {
    externalCreatedAt: subHours(new Date(), 2).toISOString(),
    id: '6ad1cbcb-2ac4-409e-aff0-48165556fc0c',
    endsAt: new Date(new Date().setHours(16, 30)).toISOString(),
    isFullDay: false,
    startsAt: new Date(new Date().setHours(15, 15)).toISOString(),
    title: 'Onboarding Follow-Up Call',
    visibility: CalendarChannelVisibility.SHARE_EVERYTHING,
    __typename: 'CalendarEvent',
  },
  {
    externalCreatedAt: subHours(new Date(), 2).toISOString(),
    id: '52cc83e3-f3dc-4c25-8a7d-5ff857612142',
    endsAt: new Date(new Date().setHours(10, 30)).toISOString(),
    isFullDay: false,
    startsAt: new Date(new Date().setHours(10, 0)).toISOString(),
    title: 'Onboarding Call',
    visibility: CalendarChannelVisibility.SHARE_EVERYTHING,
    __typename: 'CalendarEvent',
  },
  {
    externalCreatedAt: subHours(new Date(), 2).toISOString(),
    id: '5a792d11-259a-4099-af51-59eb85e15d83',
    isFullDay: true,
    startsAt: subMonths(new Date().setHours(8, 0), 1).toISOString(),
    visibility: CalendarChannelVisibility.METADATA,
    __typename: 'CalendarEvent',
  },
  {
    externalCreatedAt: subHours(new Date(), 2).toISOString(),
    id: '89e2a1c7-3d3f-4e79-a492-aa5de3785fc5',
    endsAt: subMonths(new Date().setHours(14, 30), 3).toISOString(),
    isFullDay: false,
    startsAt: subMonths(new Date().setHours(14, 0), 3).toISOString(),
    title: 'Alan x Garry',
    visibility: CalendarChannelVisibility.SHARE_EVERYTHING,
    __typename: 'CalendarEvent',
  },
];
