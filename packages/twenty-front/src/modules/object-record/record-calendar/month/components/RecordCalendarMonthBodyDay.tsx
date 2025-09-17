import { RecordCalendarCardDraggableContainer } from '@/object-record/record-calendar/record-calendar-card/components/RecordCalendarCardDraggableContainer';
import { recordCalendarSelectedDateComponentState } from '@/object-record/record-calendar/states/recordCalendarSelectedDateComponentState';
import { calendarDayRecordIdsComponentFamilySelector } from '@/object-record/record-calendar/states/selectors/calendarDayRecordsComponentFamilySelector';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { Droppable } from '@hello-pangea/dnd';
import { format, isSameDay, isSameMonth } from 'date-fns';

const StyledContainer = styled.div<{ isOtherMonth: boolean }>`
  display: flex;
  width: calc(100% / 7);
  flex-direction: column;
  min-height: 122px;
  padding: ${({ theme }) => theme.spacing(1)};
  background: ${({ theme }) => theme.background.primary};
  min-width: 0;

  &:not(:last-child) {
    border-right: 0.5px solid ${({ theme }) => theme.border.color.light};
  }

  ${({ isOtherMonth, theme }) =>
    isOtherMonth &&
    css`
      background: ${theme.background.secondary};
      color: ${theme.font.color.light};
    `}
`;

const StyledDayHeader = styled.div<{ isToday: boolean }>`
  display: flex;
  text-align: right;
  justify-content: center;
  align-items: center;
  margin-left: auto;
  width: 20px;
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(1)};
  font-size: ${({ theme }) => theme.font.size.sm};

  margin-bottom: ${({ theme }) => theme.spacing(0.5)};
  ${({ isToday, theme }) =>
    isToday &&
    css`
      border-radius: 4px;
      background: ${theme.color.red};
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

  const dayKey = format(day, 'yyyy-MM-dd');

  const recordIds = useRecoilComponentFamilyValue(
    calendarDayRecordIdsComponentFamilySelector,
    dayKey,
  );

  const isToday = isSameDay(day, new Date());

  const isOtherMonth = !isSameMonth(day, recordCalendarSelectedDate);

  return (
    <StyledContainer isOtherMonth={isOtherMonth}>
      <StyledDayHeader isToday={isToday}>{day.getDate()}</StyledDayHeader>
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
