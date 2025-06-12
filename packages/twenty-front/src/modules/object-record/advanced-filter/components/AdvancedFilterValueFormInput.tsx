import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { AdvancedFilterValueFormCompositeFieldInput } from '@/object-record/advanced-filter/components/AdvancedFilterValueFormCompositeFieldInput';
import { useApplyObjectFilterDropdownFilterValue } from '@/object-record/object-filter-dropdown/hooks/useApplyObjectFilterDropdownFilterValue';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { subFieldNameUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/subFieldNameUsedInDropdownComponentState';
import { FormFieldInput } from '@/object-record/record-field/components/FormFieldInput';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isObject } from '@sniptt/guards';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { JsonValue } from 'type-fest';

export const AdvancedFilterValueFormInput = ({
  recordFilterId,
  VariablePicker,
}: {
  recordFilterId: string;
  VariablePicker?: VariablePickerComponent;
}) => {
  const currentRecordFilters = useRecoilComponentValueV2(
    currentRecordFiltersComponentState,
  );

  const { objectMetadataItem } = useRecordIndexContextOrThrow();

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
    if (typeof newValue === 'string') {
      applyObjectFilterDropdownFilterValue(newValue);
    } else if (Array.isArray(newValue) || isObject(newValue)) {
      applyObjectFilterDropdownFilterValue(JSON.stringify(newValue));
    } else {
      applyObjectFilterDropdownFilterValue(String(newValue));
    }
  };

  const fieldMetadataItemUsedInDropdown = useRecoilComponentValueV2(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );

  const fieldDefinition = fieldMetadataItemUsedInDropdown
    ? formatFieldMetadataItemAsFieldDefinition({
        field: fieldMetadataItemUsedInDropdown,
        objectMetadataItem: objectMetadataItem,
      })
    : null;

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

  const field = {
    type: recordFilter.type as FieldMetadataType,
    label: '',
    metadata: fieldDefinition?.metadata as FieldMetadata,
  };

  return (
    <FormFieldInput
      field={field}
      defaultValue={recordFilter.value}
      onChange={handleChange}
      VariablePicker={VariablePicker}
    />
  );
};
