import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import styled from '@emotion/styled';

const StyledContainer = styled.div`
  display: flex;
  height: 24px;
`;

export const RecordCalendarMonthBody = () => {
  const recordCalendarId = useAvailableComponentInstanceIdOrThrow(
    RecordCalendarComponentInstanceContext,
  );

  return <StyledContainer>body</StyledContainer>;
};
