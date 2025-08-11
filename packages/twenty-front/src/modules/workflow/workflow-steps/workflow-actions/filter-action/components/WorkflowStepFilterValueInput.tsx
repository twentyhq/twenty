import { configurableViewFilterOperands } from '@/object-record/object-filter-dropdown/utils/configurableViewFilterOperands';
import { FormFieldInput } from '@/object-record/record-field/components/FormFieldInput';
import { FormMultiSelectFieldInput } from '@/object-record/record-field/form-types/components/FormMultiSelectFieldInput';
import { FormSingleRecordPicker } from '@/object-record/record-field/form-types/components/FormSingleRecordPicker';
import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import { type FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { WorkflowStepFilterValueCompositeInput } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/WorkflowStepFilterValueCompositeInput';
import { useGetFilterFieldMetadataItem } from '@/workflow/workflow-steps/workflow-actions/filter-action/hooks/useGetFilterFieldMetadataItem';
import { useUpsertStepFilterSettings } from '@/workflow/workflow-steps/workflow-actions/filter-action/hooks/useUpsertStepFilterSettings';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/context/WorkflowStepFilterContext';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { useLingui } from '@lingui/react/macro';
import { isObject, isString } from '@sniptt/guards';
import { useContext } from 'react';
import { FieldMetadataType, type StepFilter } from 'twenty-shared/src/types';
import { isDefined } from 'twenty-shared/utils';
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
];

const isFilterableFieldMetadataType = (
  type: string,
): type is FieldMetadataType => {
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
  ].includes(type as FieldMetadataType);
};

export const WorkflowStepFilterValueInput = ({
  stepFilter,
}: WorkflowStepFilterValueInputProps) => {
  const { t } = useLingui();
  const { readonly } = useContext(WorkflowStepFilterContext);

  const { upsertStepFilterSettings } = useUpsertStepFilterSettings();
  const { getFilterFieldMetadataItem } = useGetFilterFieldMetadataItem();

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

  const isDisabled = !stepFilter.operand;

  const operandHasNoInput =
    (stepFilter && !configurableViewFilterOperands.has(stepFilter.operand)) ??
    true;

  if (isDisabled || operandHasNoInput) {
    return null;
  }

  const {
    fieldMetadataId,
    type: variableType,
    compositeFieldSubFieldName,
  } = stepFilter;

  const { fieldMetadataItem: selectedFieldMetadataItem, objectMetadataItem } =
    isDefined(fieldMetadataId)
      ? getFilterFieldMetadataItem(fieldMetadataId)
      : {
          fieldMetadataItem: undefined,
          objectMetadataItem: undefined,
        };

  const isFilterableByMultiSelectValue =
    variableType === FieldMetadataType.MULTI_SELECT ||
    variableType === FieldMetadataType.SELECT;

  const isFullRecord =
    selectedFieldMetadataItem?.name === 'id' &&
    isDefined(objectMetadataItem?.nameSingular);

  if (isFullRecord) {
    return (
      <FormSingleRecordPicker
        defaultValue={stepFilter.value}
        onChange={handleValueChange}
        VariablePicker={WorkflowVariablePicker}
        objectNameSingular={objectMetadataItem.nameSingular}
      />
    );
  }

  if (
    !isDefined(variableType) ||
    !isFilterableFieldMetadataType(variableType) ||
    !isDefined(selectedFieldMetadataItem)
  ) {
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
        label={''}
        defaultValue={stepFilter.value}
        onChange={handleValueChange}
        readonly={readonly}
        VariablePicker={WorkflowVariablePicker}
        options={selectedFieldMetadataItem?.options ?? []}
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
    />
  );
};
