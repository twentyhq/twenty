import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type RecordGqlOperationSignature } from '@/object-record/graphql/types/RecordGqlOperationSignature';

export const FIND_ONE_CALENDAR_EVENT_OPERATION_SIGNATURE: RecordGqlOperationSignature =
  {
    objectNameSingular: CoreObjectNameSingular.CalendarEvent,
    variables: {},
    fields: {
      conferenceLink: true,
      description: true,
      endsAt: true,
      externalCreatedAt: true,
      id: true,
      isCanceled: true,
      isFullDay: true,
      location: true,
      startsAt: true,
      title: true,
      visibility: true,
      calendarEventParticipants: {
        id: true,
        person: true,
        workspaceMember: true,
        isOrganizer: true,
        responseStatus: true,
        handle: true,
        createdAt: true,
        calendarEventId: true,
        updatedAt: true,
        displayName: true,
      },
    },
  };
