import { AdvancedFilterRecordFilterOptionsDropdown } from '@/object-record/advanced-filter/components/AdvancedFilterRecordFilterOptionsDropdown';
import { AdvancedFilterSidePanelColumn } from '@/object-record/advanced-filter/side-panel/components/AdvancedFilterSidePanelColumn';
import { AdvancedFilterSidePanelLogicalOperatorCell } from '@/object-record/advanced-filter/side-panel/components/AdvancedFilterSidePanelLogicalOperatorCell';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type PersistedRecordFilter } from '@/object-record/record-filter/types/PersistedRecordFilter';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { IconAlertTriangle } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[1]};
  justify-content: space-between;
`;

type AdvancedFilterSidePanelUnresolvedRecordFilterColumnProps = {
  recordFilterGroup: RecordFilterGroup;
  unresolvedRecordFilter: PersistedRecordFilter;
  recordFilterIndex: number;
};

export const AdvancedFilterSidePanelUnresolvedRecordFilterColumn = ({
  recordFilterGroup,
  unresolvedRecordFilter,
  recordFilterIndex,
}: AdvancedFilterSidePanelUnresolvedRecordFilterColumnProps) => {
  const { readonly } = useContext(AdvancedFilterContext);

  return (
    <AdvancedFilterSidePanelColumn>
      <StyledContainer>
        <AdvancedFilterSidePanelLogicalOperatorCell
          index={recordFilterIndex}
          recordFilterGroup={recordFilterGroup}
        />
        {!readonly && (
          <AdvancedFilterRecordFilterOptionsDropdown
            recordFilterId={unresolvedRecordFilter.id}
          />
        )}
      </StyledContainer>
      <SelectControl
        selectedOption={{
          label: t`Field no longer exists`,
          value: null,
          Icon: IconAlertTriangle,
        }}
        isDisabled
      />
    </AdvancedFilterSidePanelColumn>
  );
};
