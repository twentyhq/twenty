import styled from '@emotion/styled';
import groupBy from 'lodash.groupby';

import { CalendarEventParticipant } from '@/activities/calendar/types/CalendarEventParticipant';
import { ParticipantChip } from '@/activities/components/ParticipantChip';
import { PropertyBox } from '@/object-record/record-inline-cell/property-box/components/PropertyBox';

const StyledPropertyBox = styled(PropertyBox)`
  height: ${({ theme }) => theme.spacing(6)};
  padding: 0;
`;

export const CalendarEventParticipantsResponseStatus = ({
  participants,
}: {
  participants: CalendarEventParticipant[];
}) => {
  const groupedParticipants = groupBy(participants, 'responseStatus');

  return (
    <>
      {Object.entries(groupedParticipants).map(
        ([responseStatus, participants]) => (
          <StyledPropertyBox key={responseStatus}>
            {participants.map((participant) => (
              <ParticipantChip key={participant.id} participant={participant} />
            ))}
          </StyledPropertyBox>
        ),
      )}
    </>
  );
};
