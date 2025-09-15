import { RecordCalendarMonthBodyDay } from '@/object-record/record-calendar/month/components/RecordCalendarMonthBodyDay';
import { useRecordCalendarMonthContextOrThrow } from '@/object-record/record-calendar/month/contexts/RecordCalendarMonthContext';
import styled from '@emotion/styled';
import { eachDayOfInterval, endOfWeek } from 'date-fns';

const StyledContainer = styled.div`
  display: flex;
  min-height: 122px;
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
