import styled from '@emotion/styled';

const StyledCalendarEventParticipantPlusContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

export const CalendarEventParticipantPlus = ({
  number,
}: {
  number: number;
}) => {
  return (
    <StyledCalendarEventParticipantPlusContainer>
      +{number}
    </StyledCalendarEventParticipantPlusContainer>
  );
};
