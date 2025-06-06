import { AdvancedFilterRecordFilterColumn } from '@/object-record/advanced-filter/components/AdvancedFilterRecordFilterColumn';
import { AdvancedFilterRecordFilterRow } from '@/object-record/advanced-filter/components/AdvancedFilterRecordFilterRow';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useContext } from 'react';

export const AdvancedFilterRecordFilter = ({
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
  const { isColumn } = useContext(AdvancedFilterContext);

  return isColumn ? (
    <AdvancedFilterRecordFilterColumn
      recordFilterGroup={recordFilterGroup}
      recordFilter={recordFilter}
      recordFilterIndex={recordFilterIndex}
      VariablePicker={VariablePicker}
    />
  ) : (
    <AdvancedFilterRecordFilterRow
      recordFilterGroup={recordFilterGroup}
      recordFilter={recordFilter}
      recordFilterIndex={recordFilterIndex}
    />
  );
};
