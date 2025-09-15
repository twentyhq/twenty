import { RecordCalendarMonthBody } from '@/object-record/record-calendar/month/components/RecordCalendarMonthBody';
import { RecordCalendarMonthHeader } from '@/object-record/record-calendar/month/components/RecordCalendarMonthHeader';
import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import styled from '@emotion/styled';

const StyledContainer = styled.div`
  display: flex;
  height: 24px;
`;

export const RecordCalendarMonth = () => {
  const recordCalendarId = useAvailableComponentInstanceIdOrThrow(
    RecordCalendarComponentInstanceContext,
  );

  return (
    <StyledContainer>
      <RecordCalendarMonthHeader />
      <RecordCalendarMonthBody />
    </StyledContainer>
  );
};
