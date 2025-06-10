import { AdvancedFilterDropdownRow } from '@/object-record/advanced-filter/components/AdvancedFilterDropdownRow';
import { AdvancedFilterLogicalOperatorCell } from '@/object-record/advanced-filter/components/AdvancedFilterLogicalOperatorCell';
import { AdvancedFilterRecordFilterGroupChildren } from '@/object-record/advanced-filter/components/AdvancedFilterRecordFilterGroupChildren';
import { AdvancedFilterRecordFilterGroupOptionsDropdown } from '@/object-record/advanced-filter/components/AdvancedFilterRecordFilterGroupOptionsDropdown';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';

export const AdvancedFilterRecordFilterGroupRow = ({
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
    <AdvancedFilterDropdownRow>
      <AdvancedFilterLogicalOperatorCell
        index={recordFilterGroupIndex}
        recordFilterGroup={parentRecordFilterGroup}
      />
      <AdvancedFilterRecordFilterGroupChildren
        recordFilterGroupId={recordFilterGroup.id}
        VariablePicker={VariablePicker}
      />
      <AdvancedFilterRecordFilterGroupOptionsDropdown
        recordFilterGroupId={recordFilterGroup.id}
      />
    </AdvancedFilterDropdownRow>
  );
};
