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
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div<{
  isOtherMonth: boolean;
  isDayOfWeekend: boolean;
}>`
  display: flex;
  width: calc(100% / 7);
  flex-direction: column;
  min-height: 122px;
  padding: ${themeCssVariables.spacing[1]};
  background: ${themeCssVariables.background.primary};
  min-width: 0;
  color: ${themeCssVariables.font.color.primary};

  &:not(:last-child) {
    border-right: 1px solid ${themeCssVariables.border.color.light};
  }

  ${({ isOtherMonth }) =>
    isOtherMonth
      ? `
      background: ${themeCssVariables.background.secondary};
      color: ${themeCssVariables.font.color.light};
    `
      : ''}

  ${({ isDayOfWeekend }) =>
    isDayOfWeekend
      ? `
      background: ${themeCssVariables.background.secondary};
    `
      : ''}
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
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  justify-content: center;
  line-height: 140%;
  width: 20px;

  ${({ isToday }) =>
    isToday
      ? `
      border-radius: 4px;
      background: ${themeCssVariables.color.blue};
      color: ${themeCssVariables.font.color.inverted};
      font-weight: ${themeCssVariables.font.weight.medium};
    `
      : ''}
`;

const StyledCardsContainer = styled.div<{ isDraggedOver?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['0.5']};
  flex: 1;
  min-height: 60px;
  border-radius: ${themeCssVariables.border.radius.sm};
  transition: background-color 0.1s ease;

  ${({ isDraggedOver }) =>
    isDraggedOver
      ? `
      background: ${themeCssVariables.background.transparent.lighter};
      border: 1px dashed ${themeCssVariables.border.color.medium};
    `
      : ''}
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
            // eslint-disable-next-line react/jsx-props-no-spreading
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
