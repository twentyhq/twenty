import { RecordCalendarMonthBodyDay } from '@/object-record/record-calendar/month/components/RecordCalendarMonthBodyDay';
import { useRecordCalendarMonthContextOrThrow } from '@/object-record/record-calendar/month/contexts/RecordCalendarMonthContext';
import styled from '@emotion/styled';
import { eachDayOfInterval, endOfWeek } from 'date-fns';

const StyledContainer = styled.div`
  display: flex;
  align-items: stretch;
  flex: 1;

  &:not(:last-of-type) {
    border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  }
`;

type RecordCalendarMonthBodyWeekProps = {
  startDayOfWeek: Date;
};

export const RecordCalendarMonthBodyWeek = ({
  startDayOfWeek,
}: RecordCalendarMonthBodyWeekProps) => {
  const { weekStartsOnDayIndex } = useRecordCalendarMonthContextOrThrow();

  const daysOfWeek = eachDayOfInterval({
    start: startDayOfWeek,
    end: endOfWeek(startDayOfWeek, {
      weekStartsOn: weekStartsOnDayIndex,
    }),
  });

  return (
    <StyledContainer>
      {daysOfWeek.map((day, index) => (
        <RecordCalendarMonthBodyDay key={`day-${index}`} day={day} />
      ))}
    </StyledContainer>
  );
};
