import { RecordCalendarMonthBody } from '@/object-record/record-calendar/month/components/RecordCalendarMonthBody';
import { RecordCalendarMonthHeader } from '@/object-record/record-calendar/month/components/RecordCalendarMonthHeader';
import { RecordCalendarMonthContextProvider } from '@/object-record/record-calendar/month/contexts/RecordCalendarMonthContext';
import { useRecordCalendarMonthDaysRange } from '@/object-record/record-calendar/month/hooks/useRecordCalendarMonthDaysRange';
import { recordCalendarSelectedDateComponentState } from '@/object-record/record-calendar/states/recordCalendarSelectedDateComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 1000px;
`;

export const RecordCalendarMonth = () => {
  const recordCalendarSelectedDate = useRecoilComponentValue(
    recordCalendarSelectedDateComponentState,
  );

  const {
    firstDayOfMonth,
    lastDayOfMonth,
    firstDayOfFirstWeek,
    lastDayOfLastWeek,
    weekDayLabels,
    weekFirstDays,
    weekStartsOnDayIndex,
  } = useRecordCalendarMonthDaysRange(recordCalendarSelectedDate);

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
