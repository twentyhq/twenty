import { AdvancedFilterSidePanelColumn } from '@/object-record/advanced-filter/side-panel/components/AdvancedFilterSidePanelColumn';
import { AdvancedFilterSidePanelFieldSelectDisabled } from '@/object-record/advanced-filter/side-panel/components/AdvancedFilterSidePanelFieldSelectDisabled';
import { AdvancedFilterSidePanelLogicalOperatorCell } from '@/object-record/advanced-filter/side-panel/components/AdvancedFilterSidePanelLogicalOperatorCell';

import { AdvancedFilterSidePanelRecordFilterOperandSelect } from '@/object-record/advanced-filter/side-panel/components/AdvancedFilterSidePanelRecordFilterOperandSelect';
import { AdvancedFilterSidePanelValueFormInput } from '@/object-record/advanced-filter/side-panel/components/AdvancedFilterSidePanelValueFormInput';
import { AdvancedFilterFieldSelectDropdownButton } from '@/object-record/advanced-filter/components/AdvancedFilterFieldSelectDropdownButton';
import { AdvancedFilterRecordFilterOptionsDropdown } from '@/object-record/advanced-filter/components/AdvancedFilterRecordFilterOptionsDropdown';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { getAdvancedFilterObjectFilterDropdownComponentInstanceId } from '@/object-record/advanced-filter/utils/getAdvancedFilterObjectFilterDropdownComponentInstanceId';
import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[1]};
  justify-content: space-between;
`;

type AdvancedFilterSidePanelRecordFilterColumnProps = {
  recordFilterGroup: RecordFilterGroup;
  recordFilter: RecordFilter;
  recordFilterIndex: number;
};

export const AdvancedFilterSidePanelRecordFilterColumn = ({
  recordFilterGroup,
  recordFilter,
  recordFilterIndex,
}: AdvancedFilterSidePanelRecordFilterColumnProps) => {
  const { readonly } = useContext(AdvancedFilterContext);

  return (
    <ObjectFilterDropdownComponentInstanceContext.Provider
      value={{
        instanceId: getAdvancedFilterObjectFilterDropdownComponentInstanceId(
          recordFilter.id,
        ),
      }}
    >
      <AdvancedFilterSidePanelColumn>
        <StyledContainer>
          <AdvancedFilterSidePanelLogicalOperatorCell
            index={recordFilterIndex}
            recordFilterGroup={recordFilterGroup}
          />
          {!readonly && (
            <AdvancedFilterRecordFilterOptionsDropdown
              recordFilterId={recordFilter.id}
            />
          )}
        </StyledContainer>
        {readonly ? (
          <AdvancedFilterSidePanelFieldSelectDisabled
            recordFilterId={recordFilter.id}
          />
        ) : (
          <AdvancedFilterFieldSelectDropdownButton
            recordFilterId={recordFilter.id}
          />
        )}
        <AdvancedFilterSidePanelRecordFilterOperandSelect
          recordFilterId={recordFilter.id}
        />
        <AdvancedFilterSidePanelValueFormInput
          recordFilterId={recordFilter.id}
        />
      </AdvancedFilterSidePanelColumn>
    </ObjectFilterDropdownComponentInstanceContext.Provider>
  );
};
