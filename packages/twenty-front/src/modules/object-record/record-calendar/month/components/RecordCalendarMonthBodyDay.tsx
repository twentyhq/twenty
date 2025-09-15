import styled from '@emotion/styled';
import { format } from 'date-fns';

const StyledContainer = styled.div`
  display: flex;
  height: 24px;
  width: calc(100% / 7);
`;

type RecordCalendarMonthBodyDayProps = {
  day: Date;
};

export const RecordCalendarMonthBodyDay = ({
  day,
}: RecordCalendarMonthBodyDayProps) => {
  const dayOfWeek = format(day, 'EEE');

  return <StyledContainer>{dayOfWeek}</StyledContainer>;
};
