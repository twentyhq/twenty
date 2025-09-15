import { calendarDayRecordIdsComponentFamilySelector } from '@/object-record/record-calendar/states/selectors/calendarDayRecordsComponentFamilySelector';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import styled from '@emotion/styled';

const StyledContainer = styled.div`
  display: flex;
  width: calc(100% / 7);
`;

type RecordCalendarMonthBodyDayProps = {
  day: Date;
};

export const RecordCalendarMonthBodyDay = ({
  day,
}: RecordCalendarMonthBodyDayProps) => {
  const recordIds = useRecoilComponentFamilyValue(
    calendarDayRecordIdsComponentFamilySelector,
    day.toDateString(),
  );

  return (
    <StyledContainer>
      {day.getDate()}: {recordIds.length}
    </StyledContainer>
  );
};
