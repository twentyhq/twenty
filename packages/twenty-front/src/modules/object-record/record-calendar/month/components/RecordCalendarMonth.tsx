import { RecordCalendarMonthBody } from '@/object-record/record-calendar/month/components/RecordCalendarMonthBody';
import { RecordCalendarMonthHeader } from '@/object-record/record-calendar/month/components/RecordCalendarMonthHeader';
import { RecordCalendarMonthContextProvider } from '@/object-record/record-calendar/month/contexts/RecordCalendarMonthContext';
import { useRecordCalendarMonthDaysRange } from '@/object-record/record-calendar/month/hooks/useRecordCalendarMonthDaysRange';
import styled from '@emotion/styled';

const StyledContainer = styled.div`
  display: flex;
  height: 24px;
  flex-direction: column;
`;

export const RecordCalendarMonth = () => {
  const currentDay = new Date();

  const {
    firstDayOfMonth,
    lastDayOfMonth,
    firstDayOfFirstWeek,
    lastDayOfLastWeek,
    weekDayLabels,
    weekFirstDays,
    weekStartsOnDayIndex,
  } = useRecordCalendarMonthDaysRange(currentDay);

  return (
    <RecordCalendarMonthContextProvider
      value={{
        firstDayOfMonth,
        lastDayOfMonth,
        firstDayOfFirstWeek,
        lastDayOfLastWeek,
        weekDayLabels,
        weekFirstDays,
        weekStartsOnDayIndex,
      }}
    >
      <StyledContainer>
        <RecordCalendarMonthHeader />
        <RecordCalendarMonthBody />
      </StyledContainer>
    </RecordCalendarMonthContextProvider>
  );
};
