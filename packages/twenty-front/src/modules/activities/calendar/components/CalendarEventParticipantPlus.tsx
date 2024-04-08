import styled from '@emotion/styled';

const StyledCalendarEventParticipantPlusContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.tertiary};
  border-radius: 4px;
  display: flex;
  height: 20px;
  justify-content: space-between;
  padding: 3px 4px;
  box-sizing: border-box;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.background.quaternary};
  }
`;

export const CalendarEventParticipantPlus = ({
  number,
  onClick,
}: {
  number: number;
  onClick?: () => void;
}) => {
  return (
    <StyledCalendarEventParticipantPlusContainer onClick={onClick}>
      +{number}
    </StyledCalendarEventParticipantPlusContainer>
  );
};
