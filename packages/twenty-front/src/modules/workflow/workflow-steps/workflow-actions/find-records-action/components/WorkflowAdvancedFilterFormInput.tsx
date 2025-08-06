import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { shouldShowFilterTextInput } from '@/object-record/advanced-filter/utils/shouldShowFilterTextInput';
import { useApplyObjectFilterDropdownFilterValue } from '@/object-record/object-filter-dropdown/hooks/useApplyObjectFilterDropdownFilterValue';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { subFieldNameUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/subFieldNameUsedInDropdownComponentState';
import { configurableViewFilterOperands } from '@/object-record/object-filter-dropdown/utils/configurableViewFilterOperands';
import { FormFieldInput } from '@/object-record/record-field/components/FormFieldInput';
import { FormMultiSelectFieldInput } from '@/object-record/record-field/form-types/components/FormMultiSelectFieldInput';
import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import {
  FieldMetadata,
  FieldMultiSelectMetadata,
  FieldSelectMetadata,
} from '@/object-record/record-field/types/FieldMetadata';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { WorkflowAdvancedFilterValueFormCompositeFieldInput } from '@/workflow/workflow-steps/workflow-actions/find-records-action/components/WorkflowAdvancedFilterValueFormCompositeFieldInput';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { isObject, isString } from '@sniptt/guards';
import { useContext } from 'react';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { JsonValue } from 'type-fest';

export const WorkflowAdvancedFilterValueFormInput = ({
  recordFilterId,
}: {
  recordFilterId: string;
}) => {
  const { readonly } = useContext(AdvancedFilterContext);

  const currentRecordFilters = useRecoilComponentValue(
    currentRecordFiltersComponentState,
  );

  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const subFieldNameUsedInDropdown = useRecoilComponentValue(
    subFieldNameUsedInDropdownComponentState,
  );

  const recordFilter = currentRecordFilters.find(
    (recordFilter) => recordFilter.id === recordFilterId,
  );

  const isDisabled = !recordFilter?.fieldMetadataId || !recordFilter.operand;

  const operandHasNoInput =
    (recordFilter &&
      !configurableViewFilterOperands.has(recordFilter.operand)) ??
    true;

  const { applyObjectFilterDropdownFilterValue } =
    useApplyObjectFilterDropdownFilterValue();

  const handleChange = (newValue: JsonValue) => {
    if (isString(newValue)) {
      applyObjectFilterDropdownFilterValue(newValue);
    } else if (Array.isArray(newValue) || isObject(newValue)) {
      applyObjectFilterDropdownFilterValue(JSON.stringify(newValue));
    } else {
      applyObjectFilterDropdownFilterValue(String(newValue));
    }
  };

  const fieldMetadataItemUsedInDropdown = useRecoilComponentValue(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );

  const fieldDefinition = fieldMetadataItemUsedInDropdown
    ? formatFieldMetadataItemAsFieldDefinition({
        field: fieldMetadataItemUsedInDropdown,
        objectMetadataItem: objectMetadataItem,
      })
    : null;

  if (!isDefined(recordFilter)) {
    return null;
  }

  const isFilterableByTextValue = shouldShowFilterTextInput({
    recordFilter,
    subFieldNameUsedInDropdown,
  });

  const isFilterableByMultiSelectValue =
    recordFilter.type === FieldMetadataType.MULTI_SELECT ||
    recordFilter.type === FieldMetadataType.SELECT;

  const isFilterableByDateValue =
    recordFilter.type === FieldMetadataType.DATE ||
    recordFilter.type === FieldMetadataType.DATE_TIME;

  if (isDisabled || operandHasNoInput) {
    return null;
  }

  if (isFilterableByTextValue) {
    return (
      <FormTextFieldInput
        label={''}
        defaultValue={recordFilter.value}
        onChange={handleChange}
        readonly={readonly}
        VariablePicker={WorkflowVariablePicker}
      />
    );
  }

  if (isDefined(subFieldNameUsedInDropdown)) {
    return (
      <WorkflowAdvancedFilterValueFormCompositeFieldInput
        recordFilter={recordFilter}
        onChange={handleChange}
      />
    );
  }

  if (isFilterableByMultiSelectValue) {
    const metadata = fieldDefinition?.metadata as
      | FieldMultiSelectMetadata
      | FieldSelectMetadata
      | undefined;
    return (
      <FormMultiSelectFieldInput
        label={''}
        defaultValue={recordFilter.value}
        onChange={handleChange}
        readonly={readonly}
        VariablePicker={WorkflowVariablePicker}
        options={metadata?.options ?? []}
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
      readonly={readonly}
      // VariablePicker is not supported for date filters yet
      VariablePicker={
        isFilterableByDateValue ? undefined : WorkflowVariablePicker
      }
    />
  );
};
