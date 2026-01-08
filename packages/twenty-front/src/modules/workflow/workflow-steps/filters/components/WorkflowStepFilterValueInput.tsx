import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { configurableViewFilterOperands } from '@/object-record/object-filter-dropdown/utils/configurableViewFilterOperands';
import { FormFieldInput } from '@/object-record/record-field/ui/components/FormFieldInput';
import { FormArrayFieldInput } from '@/object-record/record-field/ui/form-types/components/FormArrayFieldInput';
import { FormBooleanFieldInput } from '@/object-record/record-field/ui/form-types/components/FormBooleanFieldInput';
import { FormMultiSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormMultiSelectFieldInput';
import { FormNumberFieldInput } from '@/object-record/record-field/ui/form-types/components/FormNumberFieldInput';
import { FormRelativeDatePicker } from '@/object-record/record-field/ui/form-types/components/FormRelativeDatePicker';
import { FormSingleRecordPicker } from '@/object-record/record-field/ui/form-types/components/FormSingleRecordPicker';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { stringifyRelativeDateFilter } from '@/views/view-filter-value/utils/stringifyRelativeDateFilter';
import { WORKFLOW_TIMEZONE } from '@/workflow/constants/WorkflowTimeZone';

import { WorkflowStepFilterValueCompositeInput } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterValueCompositeInput';
import { useUpsertStepFilterSettings } from '@/workflow/workflow-steps/filters/hooks/useUpsertStepFilterSettings';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/filters/states/context/WorkflowStepFilterContext';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { useLingui } from '@lingui/react/macro';
import { isObject, isString } from '@sniptt/guards';
import { useContext } from 'react';
import {
  FieldMetadataType,
  ViewFilterOperand,
  type StepFilter,
} from 'twenty-shared/types';
import {
  isDefined,
  parseJson,
  safeParseRelativeDateFilterJSONStringified,
  type RelativeDateFilter,
} from 'twenty-shared/utils';
import { parseBooleanFromStringValue } from 'twenty-shared/workflow';
import { type JsonValue } from 'type-fest';

type WorkflowStepFilterValueInputProps = {
  stepFilter: StepFilter;
};

const COMPOSITE_FIELD_METADATA_TYPES = [
  FieldMetadataType.ADDRESS,
  FieldMetadataType.PHONES,
  FieldMetadataType.EMAILS,
  FieldMetadataType.LINKS,
  FieldMetadataType.CURRENCY,
  FieldMetadataType.ACTOR,
];

const isFilterableFieldType = (
  type: string,
): type is FieldMetadataType | 'array' | 'boolean' | 'number' => {
  return [
    FieldMetadataType.TEXT,
    FieldMetadataType.NUMBER,
    FieldMetadataType.BOOLEAN,
    FieldMetadataType.DATE_TIME,
    FieldMetadataType.DATE,
    FieldMetadataType.NUMERIC,
    FieldMetadataType.SELECT,
    FieldMetadataType.MULTI_SELECT,
    FieldMetadataType.RAW_JSON,
    FieldMetadataType.RICH_TEXT_V2,
    FieldMetadataType.ARRAY,
    FieldMetadataType.UUID,
    FieldMetadataType.RELATION,
    ...COMPOSITE_FIELD_METADATA_TYPES,
    'array',
    'boolean',
    'number',
  ].includes(type as FieldMetadataType);
};

export const WorkflowStepFilterValueInput = ({
  stepFilter,
}: WorkflowStepFilterValueInputProps) => {
  const { t } = useLingui();
  const { readonly } = useContext(WorkflowStepFilterContext);

  const { upsertStepFilterSettings } = useUpsertStepFilterSettings();

  const handleValueChange = (value: JsonValue) => {
    const valueToUpsert = isString(value)
      ? value
      : Array.isArray(value) || isObject(value)
        ? JSON.stringify(value)
        : String(value);

    upsertStepFilterSettings({
      stepFilterToUpsert: {
        ...stepFilter,
        value: valueToUpsert,
      },
    });
  };

  const handleRelativeDateFilterChange = (
    newRelativeDateFilter: RelativeDateFilter,
  ) => {
    upsertStepFilterSettings({
      stepFilterToUpsert: {
        ...stepFilter,
        value: JSON.stringify(newRelativeDateFilter),
      },
    });
  };

  const isDisabled = !stepFilter.operand;

  const operandHasNoInput =
    (stepFilter && !configurableViewFilterOperands.has(stepFilter.operand)) ??
    true;

  const {
    fieldMetadataId,
    type: variableType,
    compositeFieldSubFieldName,
  } = stepFilter;

  const { fieldMetadataItem: selectedFieldMetadataItem, objectMetadataItem } =
    useFieldMetadataItemById(fieldMetadataId ?? '');

  if (isDisabled || operandHasNoInput) {
    return null;
  }

  const isFilterableByMultiSelectValue =
    variableType === FieldMetadataType.MULTI_SELECT ||
    variableType === FieldMetadataType.SELECT;

  const isFullRecord =
    isDefined(stepFilter.isFullRecord) &&
    stepFilter.isFullRecord &&
    isDefined(objectMetadataItem?.nameSingular);

  const isDateField =
    variableType === FieldMetadataType.DATE_TIME ||
    variableType === FieldMetadataType.DATE;

  const isDateTimeField = variableType === FieldMetadataType.DATE_TIME;

  const isRelativeDateFilter =
    isDateField && stepFilter.operand === ViewFilterOperand.IS_RELATIVE;

  const relativeDateFilter = safeParseRelativeDateFilterJSONStringified(
    stepFilter.value,
  );

  const relativeDateFilterValue =
    isRelativeDateFilter && isDefined(relativeDateFilter)
      ? stringifyRelativeDateFilter(relativeDateFilter)
      : '';

  if (isFullRecord) {
    return (
      <FormSingleRecordPicker
        defaultValue={stepFilter.value}
        onChange={handleValueChange}
        VariablePicker={WorkflowVariablePicker}
        objectNameSingulars={[objectMetadataItem.nameSingular]}
        disabled={readonly}
      />
    );
  }

  if (!isDefined(variableType) || !isFilterableFieldType(variableType)) {
    return (
      <FormTextFieldInput
        defaultValue={stepFilter.value}
        onChange={handleValueChange}
        readonly={readonly}
        VariablePicker={WorkflowVariablePicker}
        placeholder={t`Enter value`}
      />
    );
  }

  if (
    isDefined(compositeFieldSubFieldName) &&
    COMPOSITE_FIELD_METADATA_TYPES.includes(variableType as FieldMetadataType)
  ) {
    return (
      <WorkflowStepFilterValueCompositeInput
        stepFilter={stepFilter}
        onChange={handleValueChange}
      />
    );
  }

  if (isFilterableByMultiSelectValue) {
    return (
      <FormMultiSelectFieldInput
        label=""
        defaultValue={stepFilter.value}
        onChange={handleValueChange}
        readonly={readonly}
        VariablePicker={WorkflowVariablePicker}
        options={selectedFieldMetadataItem?.options ?? []}
      />
    );
  }

  if (isRelativeDateFilter) {
    return (
      <FormRelativeDatePicker
        defaultValue={relativeDateFilterValue}
        onChange={handleRelativeDateFilterChange}
        readonly={readonly}
        isDateTimeField={isDateTimeField}
      />
    );
  }

  if (variableType === FieldMetadataType.ARRAY || variableType === 'array') {
    const arrayValue = parseJson<string[]>(stepFilter.value) ?? [];

    return (
      <FormArrayFieldInput
        defaultValue={arrayValue}
        onChange={handleValueChange}
        readonly={readonly}
      />
    );
  }

  if (
    variableType === FieldMetadataType.BOOLEAN ||
    variableType === 'boolean'
  ) {
    const parsedValue = parseBooleanFromStringValue(stepFilter.value) as
      | boolean
      | undefined
      | string;

    return (
      <FormBooleanFieldInput
        defaultValue={parsedValue}
        onChange={handleValueChange}
        readonly={readonly}
        VariablePicker={WorkflowVariablePicker}
      />
    );
  }

  if (variableType === 'number') {
    return (
      <FormNumberFieldInput
        defaultValue={stepFilter.value}
        onChange={handleValueChange}
        readonly={readonly}
        VariablePicker={WorkflowVariablePicker}
      />
    );
  }

  const field = {
    type: variableType as FieldMetadataType,
    label: '',
    metadata: {
      fieldName: selectedFieldMetadataItem?.name ?? '',
      options: selectedFieldMetadataItem?.options ?? [],
      relationObjectMetadataNameSingular:
        selectedFieldMetadataItem?.relation?.targetObjectMetadata?.nameSingular,
      relationType: selectedFieldMetadataItem?.relation?.type,
    } as FieldMetadata,
  };

  return (
    <FormFieldInput
      field={field}
      defaultValue={stepFilter.value}
      onChange={handleValueChange}
      readonly={readonly}
      VariablePicker={WorkflowVariablePicker}
      placeholder={t`Enter value`}
      timeZone={WORKFLOW_TIMEZONE}
    />
  );
};
