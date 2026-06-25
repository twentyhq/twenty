import { RecordCalendarCardDraggableContainer } from '@/object-record/record-calendar/record-calendar-card/components/RecordCalendarCardDraggableContainer';
import { recordCalendarSelectedDateComponentState } from '@/object-record/record-calendar/states/recordCalendarSelectedDateComponentState';
import { calendarDayRecordIdsComponentFamilySelector } from '@/object-record/record-calendar/states/selectors/calendarDayRecordsComponentFamilySelector';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { Droppable } from '@hello-pangea/dnd';
import { useState } from 'react';
import { Temporal } from 'temporal-polyfill';
import {
  isDefined,
  isPlainDateInSameMonth,
  isPlainDateInWeekend,
  isSamePlainDate,
} from 'twenty-shared/utils';
import { RecordCalendarAddNew } from '@/object-record/record-calendar/components/RecordCalendarAddNew';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div<{
  isOtherMonth: boolean;
  isDayOfWeekend: boolean;
}>`
  background: ${({ isOtherMonth, isDayOfWeekend }) =>
    isOtherMonth || isDayOfWeekend
      ? themeCssVariables.background.secondary
      : themeCssVariables.background.primary};
  color: ${({ isOtherMonth }) =>
    isOtherMonth
      ? themeCssVariables.font.color.light
      : themeCssVariables.font.color.primary};
  display: flex;
  flex-direction: column;
  min-height: 122px;
  min-width: 0;
  padding: ${themeCssVariables.spacing[1]};
  width: calc(100% / 7);

  &:not(:last-child) {
    border-right: 1px solid ${themeCssVariables.border.color.light};
  }
`;

const StyledDayHeader = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  height: 24px;
  justify-content: space-between;
  margin-left: none;
  width: 100%;
`;

const StyledDayHeaderDayContainer = styled.div`
  display: flex;
  margin-left: auto;
  padding: ${themeCssVariables.spacing['0.5']}
    ${themeCssVariables.spacing['0.5']};
`;

const StyledDayHeaderDay = styled.span<{ isToday: boolean }>`
  align-items: center;
  background: ${({ isToday }) =>
    isToday ? themeCssVariables.color.blue : 'transparent'};
  border-radius: ${({ isToday }) => (isToday ? '4px' : '0')};
  color: ${({ isToday }) =>
    isToday
      ? themeCssVariables.font.color.inverted
      : themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${({ isToday }) =>
    isToday ? themeCssVariables.font.weight.medium : 'normal'};
  justify-content: center;
  line-height: 140%;
  width: 20px;
`;

const StyledCardsContainer = styled.div<{ isDraggedOver?: boolean }>`
  background: ${({ isDraggedOver }) =>
    isDraggedOver
      ? themeCssVariables.background.transparent.lighter
      : 'transparent'};
  border: ${({ isDraggedOver }) =>
    isDraggedOver
      ? `1px dashed ${themeCssVariables.border.color.medium}`
      : 'none'};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['0.5']};
  min-height: 60px;
  transition: background-color 0.1s ease;
`;

type RecordCalendarMonthBodyDayProps = {
  day: Temporal.PlainDate;
};

export const RecordCalendarMonthBodyDay = ({
  day,
}: RecordCalendarMonthBodyDayProps) => {
  const { userTimezone } = useUserTimezone();

  const recordCalendarSelectedDate = useAtomComponentStateValue(
    recordCalendarSelectedDateComponentState,
  );

  const dayKey = day.toString();

  const recordIds = useAtomComponentFamilySelectorValue(
    calendarDayRecordIdsComponentFamilySelector,
    {
      day: day,
      timeZone: userTimezone,
    },
  );

  const todayInUserTimeZone =
    Temporal.Now.zonedDateTimeISO(userTimezone).toPlainDate();

  const [hovered, setHovered] = useState(false);

  const isToday = isSamePlainDate(day, todayInUserTimeZone);

  const isOtherMonth = isDefined(recordCalendarSelectedDate)
    ? !isPlainDateInSameMonth(day, recordCalendarSelectedDate)
    : false;

  const isDayOfWeekend = isPlainDateInWeekend(day);

  return (
    <StyledContainer
      isOtherMonth={isOtherMonth}
      isDayOfWeekend={isDayOfWeekend}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <StyledDayHeader>
        {hovered && <RecordCalendarAddNew cardDate={day} />}
        <StyledDayHeaderDayContainer>
          <StyledDayHeaderDay isToday={isToday}>{day.day}</StyledDayHeaderDay>
        </StyledDayHeaderDayContainer>
      </StyledDayHeader>
      <Droppable droppableId={dayKey}>
        {(droppableProvided, droppableSnapshot) => (
          <StyledCardsContainer
            // oxlint-disable-next-line react/jsx-props-no-spreading
            {...droppableProvided.droppableProps}
            ref={droppableProvided.innerRef}
            isDraggedOver={droppableSnapshot.isDraggingOver}
          >
            {recordIds.slice(0, 5).map((recordId, index) => (
              <RecordCalendarCardDraggableContainer
                key={recordId}
                recordId={recordId}
                index={index}
              />
            ))}
            {droppableProvided.placeholder}
          </StyledCardsContainer>
        )}
      </Droppable>
    </StyledContainer>
  );
};
