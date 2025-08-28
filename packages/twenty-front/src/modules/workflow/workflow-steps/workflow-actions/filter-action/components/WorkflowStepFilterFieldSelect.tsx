import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { useGetFieldMetadataItemByIdOrThrow } from '@/object-metadata/hooks/useGetFieldMetadataItemById';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useWorkflowVersionIdOrThrow } from '@/workflow/hooks/useWorkflowVersionIdOrThrow';
import { stepsOutputSchemaFamilySelector } from '@/workflow/states/selectors/stepsOutputSchemaFamilySelector';
import { useUpsertStepFilterSettings } from '@/workflow/workflow-steps/workflow-actions/filter-action/hooks/useUpsertStepFilterSettings';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/context/WorkflowStepFilterContext';
import { getViewFilterOperands } from '@/workflow/workflow-steps/workflow-actions/filter-action/utils/getStepFilterOperands';
import { WorkflowVariablesDropdown } from '@/workflow/workflow-variables/components/WorkflowVariablesDropdown';
import { useAvailableVariablesInWorkflowStep } from '@/workflow/workflow-variables/hooks/useAvailableVariablesInWorkflowStep';
import { extractRawVariableNamePart } from '@/workflow/workflow-variables/utils/extractRawVariableNamePart';
import { searchVariableThroughOutputSchema } from '@/workflow/workflow-variables/utils/searchVariableThroughOutputSchema';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { type StepFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type WorkflowStepFilterFieldSelectProps = {
  stepFilter: StepFilter;
};

const NON_SELECTABLE_FIELD_TYPES = [
  FieldMetadataType.ACTOR,
  FieldMetadataType.RICH_TEXT_V2,
  FieldMetadataType.ARRAY,
  FieldMetadataType.RATING,
];

export const WorkflowStepFilterFieldSelect = ({
  stepFilter,
}: WorkflowStepFilterFieldSelectProps) => {
  const { readonly } = useContext(WorkflowStepFilterContext);
  const shouldDisplayRecordFields = true;
  const shouldDisplayRecordObjects = true;

  const { upsertStepFilterSettings } = useUpsertStepFilterSettings();

  const { t } = useLingui();
  const workflowVersionId = useWorkflowVersionIdOrThrow();

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

  const { getIcon } = useIcons();

  const {
    fieldMetadataItem: filterFieldMetadataItem,
    objectMetadataItem: filterObjectMetadataItem,
  } = useFieldMetadataItemById(stepFilter.fieldMetadataId ?? '');

  const { getFieldMetadataItemByIdOrThrow } =
    useGetFieldMetadataItemByIdOrThrow();

  const availableVariablesInWorkflowStep = useAvailableVariablesInWorkflowStep({
    shouldDisplayRecordFields,
    shouldDisplayRecordObjects,
  });

  const noAvailableVariables = availableVariablesInWorkflowStep.length === 0;

  const handleChange = useRecoilCallback(
    ({ snapshot }) =>
      (variableName: string) => {
        const stepId = extractRawVariableNamePart({
          rawVariableName: variableName,
          part: 'stepId',
        });
        const [currentStepOutputSchema] = snapshot
          .getLoadable(
            stepsOutputSchemaFamilySelector({
              workflowVersionId,
              stepIds: [stepId],
            }),
          )
          .getValue();

        const {
          variableLabel,
          variableType,
          fieldMetadataId,
          compositeFieldSubFieldName,
        } = searchVariableThroughOutputSchema({
          stepOutputSchema: currentStepOutputSchema,
          rawVariableName: variableName,
          isFullRecord: false,
        });

        const {
          fieldMetadataItem: filterFieldMetadataItem,
          objectMetadataItem: filterObjectMetadataItem,
        } = isDefined(fieldMetadataId)
          ? getFieldMetadataItemByIdOrThrow(fieldMetadataId)
          : { fieldMetadataItem: undefined, objectMetadataItem: undefined };

        const filterType = isDefined(fieldMetadataId)
          ? (filterFieldMetadataItem?.type ?? 'unknown')
          : variableType;

        const isFullRecord =
          filterFieldMetadataItem?.name === 'id' &&
          isDefined(filterObjectMetadataItem?.labelSingular);

        upsertStepFilterSettings({
          stepFilterToUpsert: {
            ...stepFilter,
            stepOutputKey: variableName,
            displayValue: isFullRecord
              ? filterObjectMetadataItem.labelSingular
              : (variableLabel ?? ''),
            type: filterType ?? 'unknown',
            value: '',
            fieldMetadataId,
            compositeFieldSubFieldName,
            operand: getViewFilterOperands({
              filterType,
              subFieldName: compositeFieldSubFieldName,
            })?.[0],
          },
        });
      },
    [
      workflowVersionId,
      getFieldMetadataItemByIdOrThrow,
      upsertStepFilterSettings,
      stepFilter,
    ],
  );

  if (!isDefined(stepId)) {
    return null;
  }

  const isFullRecord =
    filterFieldMetadataItem?.name === 'id' &&
    isDefined(filterObjectMetadataItem?.labelSingular);

  const { variableLabel } = searchVariableThroughOutputSchema({
    stepOutputSchema: stepsOutputSchema?.[0],
    rawVariableName: stepFilter.stepOutputKey,
    isFullRecord,
  });

  const isSelectedFieldNotFound = !isDefined(variableLabel);
  const label = isSelectedFieldNotFound
    ? t`Select a field from a previous step`
    : variableLabel;

  const icon = isFullRecord
    ? getIcon(filterObjectMetadataItem?.icon)
    : filterFieldMetadataItem?.icon
      ? getIcon(filterFieldMetadataItem.icon)
      : undefined;

  const dropdownId = `step-filter-field-${stepFilter.id}`;

  if (noAvailableVariables) {
    return (
      <Dropdown
        dropdownId={dropdownId}
        clickableComponent={
          <SelectControl
            selectedOption={{
              value: stepFilter.stepOutputKey,
              label: t`No available fields to select`,
            }}
            isDisabled={true}
          />
        }
        dropdownComponents={[]}
      />
    );
  }

  if (readonly === true) {
    return (
      <Dropdown
        dropdownId={dropdownId}
        clickableComponent={
          <SelectControl
            selectedOption={{
              value: stepFilter.stepOutputKey,
              label,
              Icon: icon,
            }}
            isDisabled={true}
          />
        }
        dropdownComponents={[]}
      />
    );
  }

  return (
    <>
      <WorkflowVariablesDropdown
        instanceId={dropdownId}
        onVariableSelect={handleChange}
        clickableComponent={
          <SelectControl
            selectedOption={{
              label,
              value: stepFilter.stepOutputKey,
              Icon: icon,
            }}
            textAccent={isSelectedFieldNotFound ? 'placeholder' : 'default'}
          />
        }
        shouldDisplayRecordFields={shouldDisplayRecordFields}
        shouldDisplayRecordObjects={shouldDisplayRecordObjects}
        shouldEnableSelectRelationObject={true}
        fieldTypesToExclude={NON_SELECTABLE_FIELD_TYPES}
      />
    </>
  );
};
