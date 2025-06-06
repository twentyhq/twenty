import { AdvancedFilterValueFormCompositeFieldInput } from '@/object-record/advanced-filter/components/AdvancedFilterValueFormCompositeFieldInput';
import { useApplyObjectFilterDropdownFilterValue } from '@/object-record/object-filter-dropdown/hooks/useApplyObjectFilterDropdownFilterValue';
import { subFieldNameUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/subFieldNameUsedInDropdownComponentState';
import { FormFieldInput } from '@/object-record/record-field/components/FormFieldInput';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { JsonValue } from 'type-fest';

export const AdvancedFilterValueFormInput = ({
  recordFilterId,
  VariablePicker,
}: {
  recordFilterId: string;
  VariablePicker: VariablePickerComponent;
}) => {
  const currentRecordFilters = useRecoilComponentValueV2(
    currentRecordFiltersComponentState,
  );

  const subFieldNameUsedInDropdown = useRecoilComponentValueV2(
    subFieldNameUsedInDropdownComponentState,
  );

  const recordFilter = currentRecordFilters.find(
    (recordFilter) => recordFilter.id === recordFilterId,
  );

  const isDisabled = !recordFilter?.fieldMetadataId || !recordFilter.operand;

  const { applyObjectFilterDropdownFilterValue } =
    useApplyObjectFilterDropdownFilterValue();

  const handleChange = (newValue: JsonValue) => {
    applyObjectFilterDropdownFilterValue(newValue as string);
  };

  if (isDisabled) {
    return null;
  }

  if (isDefined(subFieldNameUsedInDropdown)) {
    return (
      <AdvancedFilterValueFormCompositeFieldInput
        recordFilter={recordFilter}
        VariablePicker={VariablePicker}
        onChange={handleChange}
      />
    );
  }

  return (
    <FormFieldInput
      field={{
        type: recordFilter.type as FieldMetadataType,
        label: '',
        metadata: {} as FieldMetadata,
      }}
      defaultValue={recordFilter.value}
      onChange={handleChange}
      VariablePicker={VariablePicker}
    />
  );
};
