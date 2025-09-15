import { RecordCalendarMonthBodyDay } from '@/object-record/record-calendar/month/components/RecordCalendarMonthBodyDay';
import styled from '@emotion/styled';
import { eachDayOfInterval, endOfWeek } from 'date-fns';

const StyledContainer = styled.div`
  display: flex;
  height: 24px;
`;

type RecordCalendarMonthBodyRowProps = {
  startDayOfWeek: Date;
};

export const RecordCalendarMonthBodyRow = ({
  startDayOfWeek,
}: RecordCalendarMonthBodyRowProps) => {
  const daysOfWeek = eachDayOfInterval({
    start: startDayOfWeek,
    end: endOfWeek(startDayOfWeek),
  });

  return (
    <StyledContainer>
      {daysOfWeek.map((day, index) => (
        <RecordCalendarMonthBodyDay key={`day-${index}`} day={day} />
      ))}
    </StyledContainer>
  );
};
