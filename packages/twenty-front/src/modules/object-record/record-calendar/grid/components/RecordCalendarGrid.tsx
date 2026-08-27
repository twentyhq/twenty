import { RecordCalendarGridDay } from '@/object-record/record-calendar/grid/components/RecordCalendarGridDay';
import { RecordCalendarDragDropContext } from '@/object-record/record-calendar/components/RecordCalendarDragDropContext';
import { useRecordCalendarDaysRange } from '@/object-record/record-calendar/hooks/useRecordCalendarDaysRange';
import { recordCalendarSelectedDateComponentState } from '@/object-record/record-calendar/states/recordCalendarSelectedDateComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { isPlainDateInSameMonth } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { ViewCalendarLayout } from '~/generated-metadata/graphql';

const StyledContainer = styled.div<{ isDayLayout: boolean }>`
  display: flex;
  flex-direction: column;
  min-height: 100%;
  min-width: ${({ isDayLayout }) => (isDayLayout ? '0' : '1000px')};
`;

const StyledHeader = styled.div`
  display: flex;
  height: 24px;
  width: 100%;
`;

const StyledHeaderDay = styled.div`
  color: ${themeCssVariables.font.color.light};
  display: flex;
  flex: 1;
  font-size: ${themeCssVariables.font.size.sm};
  height: 24px;
  justify-content: flex-end;
  padding: ${themeCssVariables.spacing[0]} ${themeCssVariables.spacing[1]};
`;

const StyledBody = styled.div`
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
`;

const StyledRow = styled.div`
  align-items: stretch;
  display: flex;
  flex: 1;

  &:not(:last-of-type) {
    border-bottom: 1px solid ${themeCssVariables.border.color.light};
  }
`;

type RecordCalendarGridProps = {
  calendarLayout: ViewCalendarLayout;
};

export const RecordCalendarGrid = ({
  calendarLayout,
}: RecordCalendarGridProps) => {
  const recordCalendarSelectedDate = useAtomComponentStateValue(
    recordCalendarSelectedDateComponentState,
  );
  const { days, weekDayLabels } = useRecordCalendarDaysRange(
    recordCalendarSelectedDate,
    calendarLayout,
  );

  return (
    <RecordCalendarDragDropContext>
      <StyledContainer isDayLayout={calendarLayout === ViewCalendarLayout.DAY}>
        <StyledHeader>
          {weekDayLabels.map((label, index) => (
            <StyledHeaderDay key={index}>{label}</StyledHeaderDay>
          ))}
        </StyledHeader>
        <StyledBody>
          {days.map((row) => (
            <StyledRow key={row[0].toString()}>
              {row.map((day) => (
                <RecordCalendarGridDay
                  key={day.toString()}
                  day={day}
                  isOtherMonth={
                    calendarLayout === ViewCalendarLayout.MONTH &&
                    !isPlainDateInSameMonth(day, recordCalendarSelectedDate)
                  }
                />
              ))}
            </StyledRow>
          ))}
        </StyledBody>
      </StyledContainer>
    </RecordCalendarDragDropContext>
  );
};
