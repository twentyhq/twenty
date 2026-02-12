import { RecordCalendarMonthBodyDay } from '@/object-record/record-calendar/month/components/RecordCalendarMonthBodyDay';
import { useRecordCalendarMonthContextOrThrow } from '@/object-record/record-calendar/month/contexts/RecordCalendarMonthContext';
import styled from '@emotion/styled';
import { eachDayOfInterval, endOfWeek } from 'date-fns';
import { type Temporal } from 'temporal-polyfill';
import {
  turnJSDateToPlainDate,
  turnPlainDateToShiftedDateInSystemTimeZone,
} from 'twenty-shared/utils';

const StyledContainer = styled.div`
  display: flex;
  align-items: stretch;
  flex: 1;

  &:not(:last-of-type) {
    border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  }
`;

type RecordCalendarMonthBodyWeekProps = {
  startDayOfWeek: Temporal.PlainDate;
};

export const RecordCalendarMonthBodyWeek = ({
  startDayOfWeek,
}: RecordCalendarMonthBodyWeekProps) => {
  const { weekStartsOnDayIndex } = useRecordCalendarMonthContextOrThrow();

  const daysOfWeek = eachDayOfInterval({
    start: turnPlainDateToShiftedDateInSystemTimeZone(startDayOfWeek),
    end: endOfWeek(turnPlainDateToShiftedDateInSystemTimeZone(startDayOfWeek), {
      weekStartsOn: weekStartsOnDayIndex,
    }),
  });

  return (
    <StyledContainer>
      {daysOfWeek.map((day, index) => (
        <RecordCalendarMonthBodyDay
          key={`day-${index}`}
          day={turnJSDateToPlainDate(day)}
        />
      ))}
    </StyledContainer>
  );
};
