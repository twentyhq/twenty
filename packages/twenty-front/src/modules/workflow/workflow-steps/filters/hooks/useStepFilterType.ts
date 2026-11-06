import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { useSearchVariable } from '@/workflow/workflow-variables/hooks/useSearchVariable';
import { isNonEmptyString } from '@sniptt/guards';
import { type StepFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  computeStepFilterType,
  extractRawVariableNamePart,
  UNKNOWN_STEP_FILTER_TYPE,
} from 'twenty-shared/workflow';

// Mirrors how the server compares the filter when it runs
export const useStepFilterType = (stepFilter: StepFilter): string => {
  const { fieldMetadataItem } = useFieldMetadataItemById(
    stepFilter.fieldMetadataId ?? '',
  );

  const { variableType } = useSearchVariable({
    stepId: isNonEmptyString(stepFilter.stepOutputKey)
      ? extractRawVariableNamePart({
          rawVariableName: stepFilter.stepOutputKey,
          part: 'stepId',
        })
      : '',
    rawVariableName: stepFilter.stepOutputKey,
    isFullRecord: stepFilter.isFullRecord ?? false,
  });

  if (isDefined(stepFilter.fieldMetadataId)) {
    return isDefined(fieldMetadataItem)
      ? computeStepFilterType({ fieldMetadataType: fieldMetadataItem.type })
      : UNKNOWN_STEP_FILTER_TYPE;
  }

  return computeStepFilterType({ variableType });
};
