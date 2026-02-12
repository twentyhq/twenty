import { RecordCalendarMonthBody } from '@/object-record/record-calendar/month/components/RecordCalendarMonthBody';
import { RecordCalendarMonthHeader } from '@/object-record/record-calendar/month/components/RecordCalendarMonthHeader';
import { RecordCalendarMonthContextProvider } from '@/object-record/record-calendar/month/contexts/RecordCalendarMonthContext';
import { useRecordCalendarMonthDaysRange } from '@/object-record/record-calendar/month/hooks/useRecordCalendarMonthDaysRange';
import { recordCalendarSelectedDateComponentState } from '@/object-record/record-calendar/states/recordCalendarSelectedDateComponentState';
import { useEndRecordDrag } from '@/object-record/record-drag/hooks/useEndRecordDrag';
import { useProcessCalendarCardDrop } from '@/object-record/record-drag/hooks/useProcessCalendarCardDrop';
import { useStartRecordDrag } from '@/object-record/record-drag/hooks/useStartRecordDrag';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';
import {
  DragDropContext,
  type DragStart,
  type OnDragEndResponder,
} from '@hello-pangea/dnd';
import { isDefined } from 'twenty-shared/utils';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100%;
  min-width: 1000px;
`;

export const RecordCalendarMonth = () => {
  const recordCalendarSelectedDate = useRecoilComponentValue(
    recordCalendarSelectedDateComponentState,
  );

  if (!isDefined(recordCalendarSelectedDate)) {
    throw new Error(`Cannot show RecordCalendarMonth without a selected date`);
  }

  const { processCalendarCardDrop } = useProcessCalendarCardDrop();
  const { startRecordDrag } = useStartRecordDrag();
  const { endRecordDrag } = useEndRecordDrag();

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
    startRecordDrag(start, []);
  };

  const handleDragEnd: OnDragEndResponder = (result) => {
    endRecordDrag();

    if (!result.destination) return;

    processCalendarCardDrop(result);
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
