import { useGetFieldMetadataItemById } from '@/object-metadata/hooks/useGetFieldMetadataItemById';
import { configurableViewFilterOperands } from '@/object-record/object-filter-dropdown/utils/configurableViewFilterOperands';
import { FormFieldInput } from '@/object-record/record-field/components/FormFieldInput';
import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { useWorkflowStepContextOrThrow } from '@/workflow/states/context/WorkflowStepContext';
import { stepsOutputSchemaFamilySelector } from '@/workflow/states/selectors/stepsOutputSchemaFamilySelector';
import { useUpsertStepFilterSettings } from '@/workflow/workflow-steps/workflow-actions/filter-action/hooks/useUpsertStepFilterSettings';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/context/WorkflowStepFilterContext';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { extractRawVariableNamePart } from '@/workflow/workflow-variables/utils/extractRawVariableNamePart';
import { searchVariableThroughOutputSchema } from '@/workflow/workflow-variables/utils/searchVariableThroughOutputSchema';
import { useLingui } from '@lingui/react/macro';
import { isObject, isString } from '@sniptt/guards';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';
import { FieldMetadataType, StepFilter } from 'twenty-shared/src/types';
import { isDefined } from 'twenty-shared/utils';
import { JsonValue } from 'type-fest';

type WorkflowStepFilterValueInputProps = {
  stepFilter: StepFilter;
};

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
  ].includes(type as FieldMetadataType);
};

export const WorkflowStepFilterValueInput = ({
  stepFilter,
}: WorkflowStepFilterValueInputProps) => {
  const { t } = useLingui();
  const { readonly } = useContext(WorkflowStepFilterContext);

  const { upsertStepFilterSettings } = useUpsertStepFilterSettings();
  const { workflowVersionId } = useWorkflowStepContextOrThrow();

  const stepId = extractRawVariableNamePart({
    rawVariableName: stepFilter.stepOutputKey,
    part: 'stepId',
  });

  const stepsOutputSchema = useRecoilValue(
    stepsOutputSchemaFamilySelector({
      workflowVersionId,
      stepIds: [stepId],
    }),
  );
  const { variableType, fieldMetadataId } = searchVariableThroughOutputSchema({
    stepOutputSchema: stepsOutputSchema?.[0],
    rawVariableName: stepFilter.stepOutputKey,
    isFullRecord: false,
  });

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
  const { getFieldMetadataItemById } = useGetFieldMetadataItemById();

  const isDisabled = !stepFilter.operand;

  const operandHasNoInput =
    (stepFilter && !configurableViewFilterOperands.has(stepFilter.operand)) ??
    true;

  if (isDisabled || operandHasNoInput) {
    return null;
  }

  if (isDefined(variableType) && isFilterableFieldMetadataType(variableType)) {
    const selectedFieldMetadataItem = isDefined(fieldMetadataId)
      ? getFieldMetadataItemById(fieldMetadataId)
      : undefined;

    const field = {
      type: variableType as FieldMetadataType,
      label: '',
      metadata: {
        fieldName: selectedFieldMetadataItem?.name ?? '',
        options: selectedFieldMetadataItem?.options ?? [],
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
  }

  return (
    <FormTextFieldInput
      defaultValue={stepFilter.value}
      onChange={handleValueChange}
      readonly={readonly}
      VariablePicker={WorkflowVariablePicker}
      placeholder={t`Enter value`}
    />
  );
};
