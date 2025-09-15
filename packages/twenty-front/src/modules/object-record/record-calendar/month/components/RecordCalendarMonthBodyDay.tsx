import styled from '@emotion/styled';

const StyledContainer = styled.div`
  display: flex;
  width: calc(100% / 7);
`;

type RecordCalendarMonthBodyDayProps = {
  day: Date;
};

export const RecordCalendarMonthBodyDay = ({
  day,
}: RecordCalendarMonthBodyDayProps) => {
  return <StyledContainer>{day.getDate()}</StyledContainer>;
};
