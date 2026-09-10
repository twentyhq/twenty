import { useGetFieldMetadataItemByIdOrThrow } from '@/object-metadata/hooks/useGetFieldMetadataItemById';
import { useGetInitialFilterValue } from '@/object-record/object-filter-dropdown/hooks/useGetInitialFilterValue';
import { useWorkflowVersionIdOrThrow } from '@/workflow/hooks/useWorkflowVersionIdOrThrow';
import { stepsOutputSchemaFamilySelector } from '@/workflow/states/selectors/stepsOutputSchemaFamilySelector';
import { useUpsertStepFilterSettings } from '@/workflow/workflow-steps/filters/hooks/useUpsertStepFilterSettings';
import { getStepFilterVariableSelectionSettings } from '@/workflow/workflow-steps/filters/utils/getStepFilterVariableSelectionSettings';
import { type StepOutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import { searchVariableThroughOutputSchemaV2 } from '@/workflow/workflow-variables/utils/searchVariableThroughOutputSchemaV2';
import { useStore } from 'jotai';
import {
  type FilterableAndTSVectorFieldType,
  type StepFilter,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { extractRawVariableNamePart } from 'twenty-shared/workflow';

export const useUpdateStepFilterFromVariable = ({
  stepFilter,
}: {
  stepFilter: StepFilter;
}) => {
  const { upsertStepFilterSettings } = useUpsertStepFilterSettings();
  const { getFieldMetadataItemByIdOrThrow } =
    useGetFieldMetadataItemByIdOrThrow();
  const workflowVersionId = useWorkflowVersionIdOrThrow();
  const { getInitialFilterValue } = useGetInitialFilterValue();
  const jotaiStore = useStore();

  const updateStepFilterFromVariable = ({
    rawVariableName,
    isFullRecord,
    stepType,
  }: {
    rawVariableName: string;
    isFullRecord: boolean;
    stepType: StepOutputSchemaV2['type'];
  }) => {
    const stepId = extractRawVariableNamePart({
      rawVariableName,
      part: 'stepId',
    });
    const [currentStepOutputSchema] = jotaiStore.get(
      stepsOutputSchemaFamilySelector.selectorFamily({
        workflowVersionId,
        stepIds: [stepId],
      }),
    );

    if (!isDefined(currentStepOutputSchema)) {
      throw new Error(`No output schema found for workflow step ${stepId}`);
    }

    const { variableType, fieldMetadataId, compositeFieldSubFieldName } =
      searchVariableThroughOutputSchemaV2({
        stepOutputSchema: currentStepOutputSchema,
        stepType,
        rawVariableName,
        isFullRecord,
      });
    const { fieldMetadataItem: filterFieldMetadataItem } = isDefined(
      fieldMetadataId,
    )
      ? getFieldMetadataItemByIdOrThrow(fieldMetadataId)
      : { fieldMetadataItem: undefined };
    const variableSelectionSettings = getStepFilterVariableSelectionSettings({
      rawVariableName,
      isFullRecord,
      variableType,
      fieldMetadataId,
      fieldMetadataType: filterFieldMetadataItem?.type,
      compositeFieldSubFieldName,
    });
    const { value } = getInitialFilterValue(
      variableSelectionSettings.type as FilterableAndTSVectorFieldType,
      variableSelectionSettings.operand,
    );

    upsertStepFilterSettings({
      stepFilterToUpsert: {
        ...stepFilter,
        ...variableSelectionSettings,
        value,
      },
    });
  };

  return { updateStepFilterFromVariable };
};
