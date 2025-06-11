import { AdvancedFilterDropdownColumn } from '@/object-record/advanced-filter/components/AdvancedFilterDropdownColumn';
import { AdvancedFilterFieldSelectDropdownButton } from '@/object-record/advanced-filter/components/AdvancedFilterFieldSelectDropdownButton';
import { AdvancedFilterLogicalOperatorCell } from '@/object-record/advanced-filter/components/AdvancedFilterLogicalOperatorCell';
import { AdvancedFilterRecordFilterOperandSelect } from '@/object-record/advanced-filter/components/AdvancedFilterRecordFilterOperandSelect';
import { AdvancedFilterRecordFilterOptionsDropdown } from '@/object-record/advanced-filter/components/AdvancedFilterRecordFilterOptionsDropdown';
import { AdvancedFilterValueFormInput } from '@/object-record/advanced-filter/components/AdvancedFilterValueFormInput';
import { getAdvancedFilterObjectFilterDropdownComponentInstanceId } from '@/object-record/advanced-filter/utils/getAdvancedFilterObjectFilterDropdownComponentInstanceId';
import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import styled from '@emotion/styled';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const AdvancedFilterRecordFilterColumn = ({
  recordFilterGroup,
  recordFilter,
  recordFilterIndex,
  VariablePicker,
}: {
  recordFilterGroup: RecordFilterGroup;
  recordFilter: RecordFilter;
  recordFilterIndex: number;
  VariablePicker?: VariablePickerComponent;
}) => {
  return (
    <ObjectFilterDropdownComponentInstanceContext.Provider
      value={{
        instanceId: getAdvancedFilterObjectFilterDropdownComponentInstanceId(
          recordFilter.id,
        ),
      }}
    >
      <AdvancedFilterDropdownColumn>
        <StyledContainer>
          <AdvancedFilterLogicalOperatorCell
            index={recordFilterIndex}
            recordFilterGroup={recordFilterGroup}
          />
          <AdvancedFilterRecordFilterOptionsDropdown
            recordFilterId={recordFilter.id}
          />
        </StyledContainer>
        <AdvancedFilterFieldSelectDropdownButton
          recordFilterId={recordFilter.id}
        />
        <AdvancedFilterRecordFilterOperandSelect
          recordFilterId={recordFilter.id}
        />
        <AdvancedFilterValueFormInput
          recordFilterId={recordFilter.id}
          VariablePicker={VariablePicker}
        />
      </AdvancedFilterDropdownColumn>
    </ObjectFilterDropdownComponentInstanceContext.Provider>
  );
};
