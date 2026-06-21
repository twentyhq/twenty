import groupBy from 'lodash.groupby';

import { CalendarEventParticipantsResponseStatusField } from '@/activities/calendar/components/CalendarEventParticipantsResponseStatusField';
import { type CalendarEventParticipant } from '@/activities/calendar/types/CalendarEventParticipant';
import { PropertyBox } from '@/object-record/record-inline-cell/property-box/components/PropertyBox';

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

  const responseStatusOrder: Array<'Yes' | 'Maybe' | 'No'> = [
    'Yes',
    'Maybe',
    'No',
  ];

  return (
    <PropertyBox>
      {responseStatusOrder.map((responseStatus) => (
        <CalendarEventParticipantsResponseStatusField
          key={responseStatus}
          responseStatus={responseStatus}
          participants={groupedParticipants[responseStatus] ?? []}
        />
      ))}
    </PropertyBox>
  );
};
