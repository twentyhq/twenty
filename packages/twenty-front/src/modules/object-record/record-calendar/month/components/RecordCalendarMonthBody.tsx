import { RecordCalendarMonthBodyWeek } from '@/object-record/record-calendar/month/components/RecordCalendarMonthBodyWeek';
import { useRecordCalendarMonthContextOrThrow } from '@/object-record/record-calendar/month/contexts/RecordCalendarMonthContext';
import styled from '@emotion/styled';

const StyledContainer = styled.div`
  display: flex;
  height: 24px;
  flex-direction: column;
`;

export const RecordCalendarMonthBody = () => {
  const { weekFirstDays } = useRecordCalendarMonthContextOrThrow();

  return (
    <StyledContainer>
      {weekFirstDays.map((weekFirstDay) => (
        <RecordCalendarMonthBodyWeek
          key={`week-${weekFirstDay.toDateString()}`}
          startDayOfWeek={weekFirstDay}
        />
      ))}
    </StyledContainer>
  );
};
