import { RecordCalendarAddNew } from '@/object-record/record-calendar/components/RecordCalendarAddNew';
import { RecordCalendarCard } from '@/object-record/record-calendar/record-calendar-card/components/RecordCalendarCard';
import { calendarDayRecordIdsComponentFamilySelector } from '@/object-record/record-calendar/states/selectors/calendarDayRecordsComponentFamilySelector';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { styled } from '@linaria/react';
import { useState } from 'react';
import { Temporal } from 'temporal-polyfill';
import { isPlainDateInWeekend, isSamePlainDate } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div<{ minWidthInPixels: number }>`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: ${({ minWidthInPixels }) => `${minWidthInPixels}px`};
`;

const StyledHeader = styled.div<{ dayCount: number }>`
  display: grid;
  flex: 0 0 25px;
  grid-template-columns: repeat(
    ${({ dayCount }) => dayCount},
    minmax(120px, 1fr)
  );
`;

const StyledHeaderDay = styled.div<{ isToday: boolean }>`
  align-items: center;
  color: ${({ isToday }) =>
    isToday
      ? themeCssVariables.font.color.primary
      : themeCssVariables.font.color.light};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  justify-content: flex-end;
  padding: 0 ${themeCssVariables.spacing[2]};
`;

const StyledGrid = styled.div<{ dayCount: number }>`
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: grid;
  flex: 1;
  grid-template-columns: repeat(
    ${({ dayCount }) => dayCount},
    minmax(120px, 1fr)
  );
  min-height: 0;
`;

const StyledDay = styled.div<{ isWeekend: boolean }>`
  background: ${({ isWeekend }) =>
    isWeekend
      ? themeCssVariables.background.secondary
      : themeCssVariables.background.primary};
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: ${themeCssVariables.spacing[1]};

  &:not(:first-child) {
    border-left: 1px solid ${themeCssVariables.border.color.light};
  }
`;

const StyledDayHeader = styled.div`
  align-items: center;
  display: flex;
  flex: 0 0 24px;
  justify-content: space-between;
`;

const StyledAddNewContainer = styled.div<{ isVisible: boolean }>`
  align-items: center;
  display: flex;
  flex: 0 0 24px;
  height: 24px;
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
  pointer-events: ${({ isVisible }) => (isVisible ? 'auto' : 'none')};
  width: 24px;
`;

const StyledDayNumber = styled.span<{ isToday: boolean }>`
  align-items: center;
  background: ${({ isToday }) =>
    isToday ? themeCssVariables.color.blue : 'transparent'};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${({ isToday }) =>
    isToday
      ? themeCssVariables.font.color.inverted
      : themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  height: 20px;
  justify-content: center;
  width: 20px;
`;

const StyledCards = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

type RecordCalendarDateGridDay = {
  date: Temporal.PlainDate;
  label: string;
};

type RecordCalendarDateGridDayCellProps = {
  day: Temporal.PlainDate;
  timeZone: string;
  today: Temporal.PlainDate;
};

const RecordCalendarDateGridDayCell = ({
  day,
  timeZone,
  today,
}: RecordCalendarDateGridDayCellProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const recordIds = useAtomComponentFamilySelectorValue(
    calendarDayRecordIdsComponentFamilySelector,
    { day, timeZone },
  );
  const isToday = isSamePlainDate(day, today);

  return (
    <StyledDay
      isWeekend={isPlainDateInWeekend(day)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <StyledDayHeader>
        <StyledAddNewContainer isVisible={isHovered}>
          <RecordCalendarAddNew cardDate={day} compact />
        </StyledAddNewContainer>
        <StyledDayNumber isToday={isToday}>{day.day}</StyledDayNumber>
      </StyledDayHeader>
      <StyledCards>
        {recordIds.map((recordId) => (
          <div key={recordId} data-selectable-id={recordId}>
            <RecordCalendarCard recordId={recordId} />
          </div>
        ))}
      </StyledCards>
    </StyledDay>
  );
};

type RecordCalendarDateGridProps = {
  days: readonly RecordCalendarDateGridDay[];
  minWidthInPixels: number;
  timeZone: string;
};

export const RecordCalendarDateGrid = ({
  days,
  minWidthInPixels,
  timeZone,
}: RecordCalendarDateGridProps) => {
  const today = Temporal.Now.zonedDateTimeISO(timeZone).toPlainDate();

  return (
    <StyledContainer minWidthInPixels={minWidthInPixels}>
      <StyledHeader dayCount={days.length}>
        {days.map(({ date, label }) => (
          <StyledHeaderDay
            key={date.toString()}
            isToday={isSamePlainDate(date, today)}
          >
            {label}
          </StyledHeaderDay>
        ))}
      </StyledHeader>
      <StyledGrid dayCount={days.length}>
        {days.map(({ date }) => (
          <RecordCalendarDateGridDayCell
            key={date.toString()}
            day={date}
            timeZone={timeZone}
            today={today}
          />
        ))}
      </StyledGrid>
    </StyledContainer>
  );
};
