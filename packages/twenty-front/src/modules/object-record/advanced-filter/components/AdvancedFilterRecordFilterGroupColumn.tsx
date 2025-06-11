import { AdvancedFilterDropdownColumn } from '@/object-record/advanced-filter/components/AdvancedFilterDropdownColumn';
import { AdvancedFilterLogicalOperatorCell } from '@/object-record/advanced-filter/components/AdvancedFilterLogicalOperatorCell';
import { AdvancedFilterRecordFilterGroupChildren } from '@/object-record/advanced-filter/components/AdvancedFilterRecordFilterGroupChildren';
import { AdvancedFilterRecordFilterGroupOptionsDropdown } from '@/object-record/advanced-filter/components/AdvancedFilterRecordFilterGroupOptionsDropdown';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import styled from '@emotion/styled';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const AdvancedFilterRecordFilterGroupColumn = ({
  parentRecordFilterGroup,
  recordFilterGroup,
  recordFilterGroupIndex,
  VariablePicker,
}: {
  parentRecordFilterGroup: RecordFilterGroup;
  recordFilterGroup: RecordFilterGroup;
  recordFilterGroupIndex: number;
  VariablePicker?: VariablePickerComponent;
}) => {
  return (
    <AdvancedFilterDropdownColumn>
      <StyledContainer>
        <AdvancedFilterLogicalOperatorCell
          index={recordFilterGroupIndex}
          recordFilterGroup={parentRecordFilterGroup}
        />
        <AdvancedFilterRecordFilterGroupOptionsDropdown
          recordFilterGroupId={recordFilterGroup.id}
        />
      </StyledContainer>
      <AdvancedFilterRecordFilterGroupChildren
        recordFilterGroupId={recordFilterGroup.id}
        VariablePicker={VariablePicker}
      />
    </AdvancedFilterDropdownColumn>
  );
};
