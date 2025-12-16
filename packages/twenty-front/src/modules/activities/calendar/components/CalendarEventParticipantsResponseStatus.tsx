import { t } from '@lingui/core/macro';
import groupBy from 'lodash.groupby';

import { CalendarEventParticipantsResponseStatusField } from '@/activities/calendar/components/CalendarEventParticipantsResponseStatusField';
import { type CalendarEventParticipant } from '@/activities/calendar/types/CalendarEventParticipant';

export const CalendarEventParticipantsResponseStatus = ({
  participants,
}: {
  participants: CalendarEventParticipant[];
}) => {
  const groupedParticipants = groupBy(participants, (participant) => {
    switch (participant.responseStatus) {
      case 'ACCEPTED':
        return t`Yes`;
      case 'DECLINED':
        return t`No`;
      case 'NEEDS_ACTION':
      case 'TENTATIVE':
        return t`Maybe`;
      default:
        return '';
    }
  });

  const responseStatusOrder = [t`Yes`, t`Maybe`, t`No`];

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
