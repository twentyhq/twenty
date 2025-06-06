import { AdvancedFilterRecordFilterGroupColumn } from '@/object-record/advanced-filter/components/AdvancedFilterRecordFilterGroupColumn';
import { AdvancedFilterRecordFilterGroupRow } from '@/object-record/advanced-filter/components/AdvancedFilterRecordFilterGroupRow';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { useContext } from 'react';

export const AdvancedFilterRecordFilterGroup = ({
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
  const { isColumn } = useContext(AdvancedFilterContext);

  return isColumn ? (
    <AdvancedFilterRecordFilterGroupColumn
      parentRecordFilterGroup={parentRecordFilterGroup}
      recordFilterGroup={recordFilterGroup}
      recordFilterGroupIndex={recordFilterGroupIndex}
      VariablePicker={VariablePicker}
    />
  ) : (
    <AdvancedFilterRecordFilterGroupRow
      parentRecordFilterGroup={parentRecordFilterGroup}
      recordFilterGroup={recordFilterGroup}
      recordFilterGroupIndex={recordFilterGroupIndex}
      VariablePicker={VariablePicker}
    />
  );
};
