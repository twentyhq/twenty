import { RecordCalendarMonthHeaderDay } from '@/object-record/record-calendar/month/components/RecordCalendarMonthHeaderDay';
import { useRecordCalendarMonthWeekDays } from '@/object-record/record-calendar/month/hooks/useRecordCalendarMonthWeekDays';
import styled from '@emotion/styled';

const StyledContainer = styled.div`
  display: flex;
  height: 24px;
  width: 100%;
`;

export const RecordCalendarMonthHeader = () => {
  const { labels } = useRecordCalendarMonthWeekDays();

  return (
    <StyledContainer>
      {labels.map((label, index) => (
        <RecordCalendarMonthHeaderDay key={`label-${index}`} label={label} />
      ))}
    </StyledContainer>
  );
};
