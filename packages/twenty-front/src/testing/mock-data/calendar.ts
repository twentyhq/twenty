import { addDays, subMonths } from 'date-fns';

import { CalendarEvent } from '@/activities/calendar/types/CalendarEvent';

export const mockedCalendarEvents: CalendarEvent[] = [
  {
    id: '9a6b35f1-6078-415b-9540-f62671bb81d0',
    endsAt: addDays(new Date().setHours(11, 30), 1),
    isFullDay: false,
    startsAt: addDays(new Date().setHours(10, 0), 1),
    visibility: 'METADATA',
  },
  {
    id: '19b32878-a950-4968-9e3b-ce5da514ea41',
    endsAt: new Date(new Date().setHours(18, 40)),
    isCanceled: true,
    isFullDay: false,
    startsAt: new Date(new Date().setHours(18, 0)),
    title: 'Bug solving',
    visibility: 'SHARE_EVERYTHING',
  },
  {
    id: '6ad1cbcb-2ac4-409e-aff0-48165556fc0c',
    endsAt: new Date(new Date().setHours(16, 30)),
    isFullDay: false,
    startsAt: new Date(new Date().setHours(15, 15)),
    title: 'Onboarding Follow-Up Call',
    visibility: 'SHARE_EVERYTHING',
  },
  {
    id: '52cc83e3-f3dc-4c25-8a7d-5ff857612142',
    endsAt: new Date(new Date().setHours(10, 30)),
    isFullDay: false,
    startsAt: new Date(new Date().setHours(10, 0)),
    title: 'Onboarding Call',
    visibility: 'SHARE_EVERYTHING',
  },
  {
    id: '5a792d11-259a-4099-af51-59eb85e15d83',
    isFullDay: true,
    startsAt: subMonths(new Date().setHours(8, 0), 1),
    visibility: 'METADATA',
  },
  {
    id: '89e2a1c7-3d3f-4e79-a492-aa5de3785fc5',
    endsAt: subMonths(new Date().setHours(14, 30), 3),
    isFullDay: false,
    startsAt: subMonths(new Date().setHours(14, 0), 3),
    title: 'Alan x Garry',
    visibility: 'SHARE_EVERYTHING',
  },
];
