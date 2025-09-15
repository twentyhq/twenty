import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { recordIndexCalendarLayoutState } from '@/object-record/record-index/states/recordIndexCalendarLayoutState';
import { Select } from '@/ui/input/components/Select';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { ViewCalendarLayout } from '~/generated/graphql';

const StyledContainer = styled.div`
  display: flex;
  height: 24px;
`;

export const RecordCalendarTopBar = () => {
  const recordCalendarId = useAvailableComponentInstanceIdOrThrow(
    RecordCalendarComponentInstanceContext,
  );


  const recordCalendarLayout = useRecoilValue(recordIndexCalendarLayoutState);

  return (
    <StyledContainer>
      <Select
        dropdownId={`record-calendar-top-bar-layout-select-${recordCalendarId}`}
        selectSizeVariant="small"
        options={[
          {
            label: 'Month',
            value: ViewCalendarLayout.MONTH,
          },
          {
            label: 'Week',
            value: ViewCalendarLayout.WEEK,
          },
          {
            label: 'Timeline',
            value: ViewCalendarLayout.DAY,
          },
        ]}
        disabled
        value={recordCalendarLayout}
        onChange={() => {}}
      />
    </StyledContainer>
  );
};
