import { RecordCalendarCard } from '@/object-record/record-calendar/record-calendar-card/components/RecordCalendarCard';
import { calendarDayRecordIdsComponentFamilySelector } from '@/object-record/record-calendar/states/selectors/calendarDayRecordsComponentFamilySelector';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import styled from '@emotion/styled';

const StyledContainer = styled.div`
  display: flex;
  width: calc(100% / 7);
  flex-direction: column;
  min-height: 122px;
`;

const StyledDayHeader = styled.div`
  display: flex;
  width: 100%;
  text-align: right;
  justify-content: flex-end;
`;

const StyledCardsContainer = styled.div`
  display: flex;
  flex-direction: column;
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
      <StyledDayHeader>{day.getDate()}</StyledDayHeader>
      <StyledCardsContainer>
        {recordIds.slice(0, 5).map((recordId) => (
          <RecordCalendarCard key={recordId} recordId={recordId} />
        ))}
      </StyledCardsContainer>
    </StyledContainer>
  );
};
