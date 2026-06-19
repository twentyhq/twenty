import { CalendarEventParticipantsResponseStatus } from '@/activities/calendar/components/CalendarEventParticipantsResponseStatus';
import { type CalendarEventParticipant } from '@/activities/calendar/types/CalendarEventParticipant';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';

const CALENDAR_EVENT_PARTICIPANT_OBJECT_NAME_SINGULAR =
  'calendarEventParticipant';

type CalendarEventParticipantsFieldWidgetProps = {
  recordId: string;
};

type CalendarEventParticipantRecord = CalendarEventParticipant & {
  __typename: 'CalendarEventParticipant';
};

export const CalendarEventParticipantsFieldWidget = ({
  recordId,
}: CalendarEventParticipantsFieldWidgetProps) => {
  const { records: calendarEventParticipants } =
    useFindManyRecords<CalendarEventParticipantRecord>({
      objectNameSingular: CALENDAR_EVENT_PARTICIPANT_OBJECT_NAME_SINGULAR,
      filter: {
        calendarEventId: {
          eq: recordId,
        },
      },
      recordGqlFields: {
        id: true,
        person: true,
        workspaceMember: true,
        isOrganizer: true,
        responseStatus: true,
        handle: true,
        displayName: true,
      },
    });

  if (calendarEventParticipants.length === 0) {
    return null;
  }

  return (
    <CalendarEventParticipantsResponseStatus
      participants={calendarEventParticipants}
    />
  );
};
