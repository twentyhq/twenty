import { AdvancedFilterSidePanelColumn } from '@/object-record/advanced-filter/side-panel/components/AdvancedFilterSidePanelColumn';
import { AdvancedFilterSidePanelLogicalOperatorCell } from '@/object-record/advanced-filter/side-panel/components/AdvancedFilterSidePanelLogicalOperatorCell';
import { AdvancedFilterSidePanelRecordFilterGroupChildren } from '@/object-record/advanced-filter/side-panel/components/AdvancedFilterSidePanelRecordFilterGroupChildren';
import { AdvancedFilterRecordFilterGroupOptionsDropdown } from '@/object-record/advanced-filter/components/AdvancedFilterRecordFilterGroupOptionsDropdown';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';

import { styled } from '@linaria/react';
import { useContext } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: ${themeCssVariables.spacing[1]};
`;

export const AdvancedFilterSidePanelRecordFilterGroupColumn = ({
  parentRecordFilterGroup,
  recordFilterGroup,
  recordFilterGroupIndex,
}: {
  parentRecordFilterGroup: RecordFilterGroup;
  recordFilterGroup: RecordFilterGroup;
  recordFilterGroupIndex: number;
}) => {
  const { readonly } = useContext(AdvancedFilterContext);

  return (
    <AdvancedFilterSidePanelColumn>
      <StyledContainer>
        <AdvancedFilterSidePanelLogicalOperatorCell
          index={recordFilterGroupIndex}
          recordFilterGroup={parentRecordFilterGroup}
        />
        {!readonly && (
          <AdvancedFilterRecordFilterGroupOptionsDropdown
            recordFilterGroupId={recordFilterGroup.id}
          />
        )}
      </StyledContainer>
      <AdvancedFilterSidePanelRecordFilterGroupChildren
        recordFilterGroupId={recordFilterGroup.id}
      />
    </AdvancedFilterSidePanelColumn>
  );
};
