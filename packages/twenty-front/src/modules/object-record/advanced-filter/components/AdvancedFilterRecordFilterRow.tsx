import { AdvancedFilterDropdownRow } from '@/object-record/advanced-filter/components/AdvancedFilterDropdownRow';
import { AdvancedFilterFieldSelectDropdownButton } from '@/object-record/advanced-filter/components/AdvancedFilterFieldSelectDropdownButton';
import { AdvancedFilterLogicalOperatorCell } from '@/object-record/advanced-filter/components/AdvancedFilterLogicalOperatorCell';
import { AdvancedFilterRecordFilterOperandSelect } from '@/object-record/advanced-filter/components/AdvancedFilterRecordFilterOperandSelect';
import { AdvancedFilterRecordFilterOptionsDropdown } from '@/object-record/advanced-filter/components/AdvancedFilterRecordFilterOptionsDropdown';
import { AdvancedFilterValueFormInput } from '@/object-record/advanced-filter/components/AdvancedFilterValueFormInput';
import { AdvancedFilterValueInput } from '@/object-record/advanced-filter/components/AdvancedFilterValueInput';
import { getAdvancedFilterObjectFilterDropdownComponentInstanceId } from '@/object-record/advanced-filter/utils/getAdvancedFilterObjectFilterDropdownComponentInstanceId';
import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { isDefined } from 'twenty-shared/utils';

export const AdvancedFilterRecordFilterRow = ({
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
      <AdvancedFilterDropdownRow>
        <AdvancedFilterLogicalOperatorCell
          index={recordFilterIndex}
          recordFilterGroup={recordFilterGroup}
        />
        <AdvancedFilterFieldSelectDropdownButton
          recordFilterId={recordFilter.id}
        />
        <AdvancedFilterRecordFilterOperandSelect
          recordFilterId={recordFilter.id}
        />
        {isDefined(VariablePicker) ? (
          <AdvancedFilterValueFormInput
            recordFilterId={recordFilter.id}
            VariablePicker={VariablePicker}
          />
        ) : (
          <AdvancedFilterValueInput recordFilterId={recordFilter.id} />
        )}
        <AdvancedFilterRecordFilterOptionsDropdown
          recordFilterId={recordFilter.id}
        />
      </AdvancedFilterDropdownRow>
    </ObjectFilterDropdownComponentInstanceContext.Provider>
  );
};
