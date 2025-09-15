import { RecordCalendarMonthBodyRow } from '@/object-record/record-calendar/month/components/RecordCalendarMonthBodyRow';
import styled from '@emotion/styled';
import { eachWeekOfInterval, endOfMonth, startOfMonth } from 'date-fns';

const StyledContainer = styled.div`
  display: flex;
  height: 24px;
  flex-direction: column;
`;

export const RecordCalendarMonthBody = () => {
  const firstDayOfMonth = startOfMonth(new Date());

  const weeks = eachWeekOfInterval({
    start: firstDayOfMonth,
    end: endOfMonth(firstDayOfMonth),
  });

  return (
    <StyledContainer>
      {weeks.map((week, index) => (
        <RecordCalendarMonthBodyRow
          key={`week-${index}`}
          startDayOfWeek={week}
        />
      ))}
    </StyledContainer>
  );
};
