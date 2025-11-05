import { RecordCalendarCardDraggableContainer } from '@/object-record/record-calendar/record-calendar-card/components/RecordCalendarCardDraggableContainer';
import { recordCalendarSelectedDateComponentState } from '@/object-record/record-calendar/states/recordCalendarSelectedDateComponentState';
import { calendarDayRecordIdsComponentFamilySelector } from '@/object-record/record-calendar/states/selectors/calendarDayRecordsComponentFamilySelector';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { Droppable } from '@hello-pangea/dnd';
import { format, isSameDay, isSameMonth, isWeekend } from 'date-fns';
import { useState } from 'react';
import { DATE_TYPE_FORMAT } from 'twenty-shared/constants';
import { RecordCalendarAddNew } from '../../components/RecordCalendarAddNew';

const StyledContainer = styled.div<{
  isOtherMonth: boolean;
  isDayOfWeekend: boolean;
}>`
  display: flex;
  width: calc(100% / 7);
  flex-direction: column;
  min-height: 122px;
  padding: ${({ theme }) => theme.spacing(1)};
  background: ${({ theme }) => theme.background.primary};
  min-width: 0;
  color: ${({ theme }) => theme.font.color.primary};

  &:not(:last-child) {
    border-right: 1px solid ${({ theme }) => theme.border.color.light};
  }

  ${({ isOtherMonth, theme }) =>
    isOtherMonth &&
    css`
      background: ${theme.background.secondary};
      color: ${theme.font.color.light};
    `}

  ${({ isDayOfWeekend, theme }) =>
    isDayOfWeekend &&
    css`
      background: ${theme.background.secondary};
    `}
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
  padding: ${({ theme }) => theme.spacing(0.5, 0.5)};
`;

const StyledDayHeaderDay = styled.span<{ isToday: boolean }>`
  align-items: center;
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  justify-content: center;
  line-height: 140%;
  width: 20px;

  ${({ isToday, theme }) =>
    isToday &&
    css`
      border-radius: 4px;
      background: ${theme.color.blue};
      color: ${theme.font.color.inverted};
      font-weight: ${theme.font.weight.medium};
    `}
`;

const StyledCardsContainer = styled.div<{ isDraggedOver?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
  flex: 1;
  min-height: 60px;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  transition: background-color 0.1s ease;

  ${({ isDraggedOver, theme }) =>
    isDraggedOver &&
    css`
      background: ${theme.background.transparent.lighter};
      border: 1px dashed ${theme.border.color.medium};
    `}
`;

type RecordCalendarMonthBodyDayProps = {
  day: Date;
};

export const RecordCalendarMonthBodyDay = ({
  day,
}: RecordCalendarMonthBodyDayProps) => {
  const recordCalendarSelectedDate = useRecoilComponentValue(
    recordCalendarSelectedDateComponentState,
  );

  const dayKey = format(day, DATE_TYPE_FORMAT);

  const recordIds = useRecoilComponentFamilyValue(
    calendarDayRecordIdsComponentFamilySelector,
    dayKey,
  );

  const [hovered, setHovered] = useState(false);

  const isToday = isSameDay(day, new Date());

  const isOtherMonth = !isSameMonth(day, recordCalendarSelectedDate);

  const isDayOfWeekend = isWeekend(day);

  const utcDate = new Date(
    Date.UTC(day.getFullYear(), day.getMonth(), day.getDate()),
  );

  return (
    <StyledContainer
      isOtherMonth={isOtherMonth}
      isDayOfWeekend={isDayOfWeekend}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <StyledDayHeader>
        {hovered && <RecordCalendarAddNew cardDate={utcDate.toISOString()} />}
        <StyledDayHeaderDayContainer>
          <StyledDayHeaderDay isToday={isToday}>
            {day.getDate()}
          </StyledDayHeaderDay>
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
