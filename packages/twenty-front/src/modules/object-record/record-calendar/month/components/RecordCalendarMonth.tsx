import { RecordCalendarMonthBody } from '@/object-record/record-calendar/month/components/RecordCalendarMonthBody';
import { RecordCalendarMonthHeader } from '@/object-record/record-calendar/month/components/RecordCalendarMonthHeader';
import { RecordCalendarMonthContextProvider } from '@/object-record/record-calendar/month/contexts/RecordCalendarMonthContext';
import { useRecordCalendarMonthDaysRange } from '@/object-record/record-calendar/month/hooks/useRecordCalendarMonthDaysRange';
import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { recordCalendarSelectedDateComponentState } from '@/object-record/record-calendar/states/recordCalendarSelectedDateComponentState';
import { useHandleDragOneCalendarCard } from '@/object-record/record-drag/calendar/hooks/useRecordCalendarDragOperations';
import { useEndRecordDrag } from '@/object-record/record-drag/shared/hooks/useEndRecordDrag';
import { useStartRecordDrag } from '@/object-record/record-drag/shared/hooks/useStartRecordDrag';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';
import {
  DragDropContext,
  type DragStart,
  type OnDragEndResponder,
} from '@hello-pangea/dnd';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 1000px;
`;

export const RecordCalendarMonth = () => {
  const recordCalendarId = useAvailableComponentInstanceIdOrThrow(
    RecordCalendarComponentInstanceContext,
  );

  const recordCalendarSelectedDate = useRecoilComponentValue(
    recordCalendarSelectedDateComponentState,
  );

  const { processDragOperation } = useHandleDragOneCalendarCard();
  const { startDrag } = useStartRecordDrag('calendar', recordCalendarId);
  const { endDrag } = useEndRecordDrag('calendar', recordCalendarId);

  const {
    firstDayOfMonth,
    lastDayOfMonth,
    firstDayOfFirstWeek,
    lastDayOfLastWeek,
    weekDayLabels,
    weekFirstDays,
    weekStartsOnDayIndex,
  } = useRecordCalendarMonthDaysRange(recordCalendarSelectedDate);

  const handleDragStart = (start: DragStart) => {
    startDrag(start, []);
  };

  const handleDragEnd: OnDragEndResponder = (result) => {
    endDrag();
    if (!result.destination) return;
    processDragOperation(result);
  };

  return (
    <RecordCalendarMonthContextProvider
      value={{
        firstDayOfMonth,
        lastDayOfMonth,
        firstDayOfFirstWeek,
        lastDayOfLastWeek,
        weekDayLabels,
        weekFirstDays,
        weekStartsOnDayIndex,
      }}
    >
      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <StyledContainer>
          <RecordCalendarMonthHeader />
          <RecordCalendarMonthBody />
        </StyledContainer>
      </DragDropContext>
    </RecordCalendarMonthContextProvider>
  );
};
