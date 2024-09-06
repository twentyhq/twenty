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
        return 'Sim';
      case 'DECLINED':
        return 'Não';
      case 'NEEDS_ACTION':
      case 'TENTATIVE':
        return 'Talvez';
      default:
        return '';
    }
  });

  const responseStatusOrder: ('Sim' | 'Talvez' | 'Não')[] = [
    'Sim',
    'Talvez',
    'Não',
  ];

  return (
    <>
      {responseStatusOrder.map((responseStatus) => (
        <CalendarEventParticipantsResponseStatusField
          key={responseStatus}
          responseStatus={responseStatus}
          participants={groupedParticipants[responseStatus] || []}
        />
      ))}
    </>
  );
};
