import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { Select } from '@/ui/input/components/Select';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import styled from '@emotion/styled';

const StyledContainer = styled.div`
  display: flex;
  height: 24px;
`;

export const RecordCalendarTopBar = () => {
  const recordCalendarId = useAvailableComponentInstanceIdOrThrow(
    RecordCalendarComponentInstanceContext,
  );

  return (
    <StyledContainer>
      <Select
        dropdownId={`record-calendar-top-bar-layout-select-${recordCalendarId}`}
        selectSizeVariant="small"
        options={[
          {
            label: 'Month',
            value: 'MONTH',
          },
        ]}
        value={''}
        onChange={() => {}}
      />
    </StyledContainer>
  );
};
