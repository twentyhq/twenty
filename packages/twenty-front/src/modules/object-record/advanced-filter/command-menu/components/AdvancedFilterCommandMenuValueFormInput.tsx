import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { AdvancedFilterCommandMenuValueFormCompositeFieldInput } from '@/object-record/advanced-filter/command-menu/components/AdvancedFilterCommandMenuValueFormCompositeFieldInput';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { shouldShowFilterTextInput } from '@/object-record/advanced-filter/utils/shouldShowFilterTextInput';
import { useApplyObjectFilterDropdownFilterValue } from '@/object-record/object-filter-dropdown/hooks/useApplyObjectFilterDropdownFilterValue';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { subFieldNameUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/subFieldNameUsedInDropdownComponentState';
import { configurableViewFilterOperands } from '@/object-record/object-filter-dropdown/utils/configurableViewFilterOperands';
import { FormFieldInput } from '@/object-record/record-field/ui/components/FormFieldInput';
import { FormBooleanFieldInput } from '@/object-record/record-field/ui/form-types/components/FormBooleanFieldInput';
import { FormMultiSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormMultiSelectFieldInput';
import { FormRelativeDatePicker } from '@/object-record/record-field/ui/form-types/components/FormRelativeDatePicker';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import {
  type FieldMetadata,
  type FieldMultiSelectMetadata,
  type FieldSelectMetadata,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { stringifyRelativeDateFilter } from '@/views/view-filter-value/utils/stringifyRelativeDateFilter';
import { WORKFLOW_TIMEZONE } from '@/workflow/constants/WorkflowTimeZone';
import { isObject, isString } from '@sniptt/guards';
import { useContext } from 'react';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined, type RelativeDateFilter } from 'twenty-shared/utils';
import { parseBooleanFromStringValue } from 'twenty-shared/workflow';
import { type JsonValue } from 'type-fest';

export const AdvancedFilterCommandMenuValueFormInput = ({
  recordFilterId,
}: {
  recordFilterId: string;
}) => {
  const {
    readonly,
    VariablePicker,
    objectMetadataItem,
    isWorkflowFindRecords,
  } = useContext(AdvancedFilterContext);

  const currentRecordFilters = useRecoilComponentValue(
    currentRecordFiltersComponentState,
  );

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

  const handleRelativeDateFilterChange = (newValue: RelativeDateFilter) => {
    applyObjectFilterDropdownFilterValue(stringifyRelativeDateFilter(newValue));
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

  const isRelativeDateFilter =
    isFilterableByDateValue &&
    recordFilter.operand === RecordFilterOperand.IS_RELATIVE;

  if (isDisabled || operandHasNoInput) {
    return null;
  }

  if (isRelativeDateFilter) {
    return (
      <FormRelativeDatePicker
        defaultValue={recordFilter.value}
        onChange={handleRelativeDateFilterChange}
        readonly={readonly}
      />
    );
  }

  if (isFilterableByTextValue) {
    return (
      <FormTextFieldInput
        label=""
        defaultValue={recordFilter.value}
        onChange={handleChange}
        readonly={readonly}
        VariablePicker={VariablePicker}
      />
    );
  }

  if (isDefined(subFieldNameUsedInDropdown)) {
    return (
      <AdvancedFilterCommandMenuValueFormCompositeFieldInput
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
        label=""
        defaultValue={recordFilter.value}
        onChange={handleChange}
        readonly={readonly}
        VariablePicker={VariablePicker}
        options={metadata?.options ?? []}
      />
    );
  }

  if (recordFilter.type === FieldMetadataType.BOOLEAN) {
    const parsedValue = parseBooleanFromStringValue(recordFilter.value) as
      | boolean
      | undefined
      | string;

    return (
      <FormBooleanFieldInput
        label=""
        defaultValue={parsedValue}
        onChange={handleChange}
        readonly={readonly}
        VariablePicker={VariablePicker}
      />
    );
  }

  const field = {
    type: recordFilter.type as FieldMetadataType,
    label: '',
    metadata: fieldDefinition?.metadata as FieldMetadata,
  };

  const shouldUseUTCTimeZone = isWorkflowFindRecords === true;
  const timeZone = shouldUseUTCTimeZone ? WORKFLOW_TIMEZONE : undefined;

  return (
    <FormFieldInput
      field={field}
      defaultValue={recordFilter.value}
      onChange={handleChange}
      readonly={readonly}
      // VariablePicker is not supported for date filters yet
      VariablePicker={isFilterableByDateValue ? undefined : VariablePicker}
      timeZone={timeZone}
    />
  );
};
