import groupBy from 'lodash.groupby';

import { CalendarEventParticipantsResponseStatusField } from '@/activities/calendar/components/CalendarEventParticipantsResponseStatusField';
import { CalendarEventParticipant } from '@/activities/calendar/types/CalendarEventParticipant';

export const CalendarEventParticipantsResponseStatus = ({
  participants,
}: {
  participants: CalendarEventParticipant[];
}) => {
  const groupedParticipants = groupBy(participants, (participant) => {
    switch (participant.responseStatus) {
      case 'ACCEPTED':
        return 'Yes';
      case 'DECLINED':
        return 'No';
      case 'NEEDS_ACTION':
      case 'TENTATIVE':
        return 'Maybe';
      default:
        return '';
    }
  });

  const responseStatusOrder = ['Yes', 'Maybe', 'No'];

  return (
    <>
      {Object.entries(groupedParticipants).map(
        ([responseStatus, participants]) => (
          <CalendarEventParticipantsResponseStatusField
            key={responseStatus}
            responseStatus={responseStatus as 'Yes' | 'Maybe' | 'No'}
            participants={participants}
          />
        ),
      )}
    </>
  );
};
