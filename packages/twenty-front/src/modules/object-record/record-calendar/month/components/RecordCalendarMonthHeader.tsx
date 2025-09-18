import { RecordCalendarMonthHeaderDay } from '@/object-record/record-calendar/month/components/RecordCalendarMonthHeaderDay';
import { useRecordCalendarMonthContextOrThrow } from '@/object-record/record-calendar/month/contexts/RecordCalendarMonthContext';
import styled from '@emotion/styled';

const StyledContainer = styled.div`
  display: flex;
  height: 24px;
  width: 100%;
`;

export const RecordCalendarMonthHeader = () => {
  const { weekDayLabels } = useRecordCalendarMonthContextOrThrow();

  return (
    <StyledContainer>
      {weekDayLabels.map((label, index) => (
        <RecordCalendarMonthHeaderDay key={`label-${index}`} label={label} />
      ))}
    </StyledContainer>
  );
};
