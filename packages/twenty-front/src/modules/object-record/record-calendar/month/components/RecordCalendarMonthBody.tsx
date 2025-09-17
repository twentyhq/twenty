import { RecordCalendarMonthBodyWeek } from '@/object-record/record-calendar/month/components/RecordCalendarMonthBodyWeek';
import { useRecordCalendarMonthContextOrThrow } from '@/object-record/record-calendar/month/contexts/RecordCalendarMonthContext';
import styled from '@emotion/styled';
import { format } from 'date-fns';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  border: 0.5px solid ${({ theme }) => theme.border.color.light};
  border-radius: 4px;
  overflow: hidden;
`;

export const RecordCalendarMonthBody = () => {
  const { weekFirstDays } = useRecordCalendarMonthContextOrThrow();

  return (
    <StyledContainer>
      {weekFirstDays.map((weekFirstDay) => (
        <RecordCalendarMonthBodyWeek
          key={`week-${format(weekFirstDay, 'yyyy-MM-dd')}`}
          startDayOfWeek={weekFirstDay}
        />
      ))}
    </StyledContainer>
  );
};
