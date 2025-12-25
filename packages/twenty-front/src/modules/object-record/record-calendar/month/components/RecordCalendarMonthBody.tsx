import { RecordCalendarMonthBodyWeek } from '@/object-record/record-calendar/month/components/RecordCalendarMonthBodyWeek';
import { useRecordCalendarMonthContextOrThrow } from '@/object-record/record-calendar/month/contexts/RecordCalendarMonthContext';
import styled from '@emotion/styled';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: 4px;
  overflow: hidden;
`;

export const RecordCalendarMonthBody = () => {
  const { weekFirstDays } = useRecordCalendarMonthContextOrThrow();

  return (
    <StyledContainer>
      {weekFirstDays.map((weekFirstDay) => (
        <RecordCalendarMonthBodyWeek
          key={`week-${weekFirstDay.toString()}`}
          startDayOfWeek={weekFirstDay}
        />
      ))}
    </StyledContainer>
  );
};
