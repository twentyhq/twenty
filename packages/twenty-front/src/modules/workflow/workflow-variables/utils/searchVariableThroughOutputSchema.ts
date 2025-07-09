import { CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX } from '@/workflow/workflow-variables/constants/CaptureAllVariableTagInnerRegex';
import {
  OutputSchema,
  StepOutputSchema,
} from '@/workflow/workflow-variables/types/StepOutputSchema';
import { isBaseOutputSchema } from '@/workflow/workflow-variables/utils/isBaseOutputSchema';
import { isLinkOutputSchema } from '@/workflow/workflow-variables/utils/isLinkOutputSchema';
import { isRecordOutputSchema } from '@/workflow/workflow-variables/utils/isRecordOutputSchema';
import { isDefined } from 'twenty-shared/utils';

const getDisplayedSubStepObjectLabel = (outputSchema: OutputSchema) => {
  if (!isRecordOutputSchema(outputSchema)) {
    return;
  }

  return outputSchema.object.label;
};

const getDisplayedSubStepFieldLabel = (
  key: string,
  outputSchema: OutputSchema,
) => {
  if (isBaseOutputSchema(outputSchema)) {
    return outputSchema[key]?.label;
  }

  if (isRecordOutputSchema(outputSchema)) {
    return outputSchema.fields[key]?.label;
  }

  return;
};

const getVariableType = (key: string, outputSchema: OutputSchema): string => {
  if (isRecordOutputSchema(outputSchema)) {
    return outputSchema.fields[key]?.type ?? 'unknown';
  }

  if (isLinkOutputSchema(outputSchema)) {
    return 'unknown';
  }

  return outputSchema[key]?.type ?? 'unknown';
};

const searchCurrentStepOutputSchema = ({
  stepOutputSchema,
  path,
  isFullRecord,
  selectedField,
}: {
  stepOutputSchema: StepOutputSchema;
  path: string[];
  isFullRecord: boolean;
  selectedField: string;
}) => {
  let currentSubStep = stepOutputSchema.outputSchema;
  let nextKeyIndex = 0;
  let nextKey = path[nextKeyIndex];
  let variablePathLabel = stepOutputSchema.name;
  let isSelectedFieldInNextKey = false;

  const handleFieldNotFound = () => {
    if (nextKeyIndex + 1 < path.length) {
      // If the key is not found in the step, we handle the case where the path has been wrongly split
      // For example, if there is a dot in the field name
      nextKey = `${nextKey}.${path[nextKeyIndex + 1]}`;
    } else {
      // If we already reached the end of the path, we add the selected field to the next key
      nextKey = `${nextKey}.${selectedField}`;
      isSelectedFieldInNextKey = true;
    }
  };

  while (nextKeyIndex < path.length) {
    if (!isDefined(currentSubStep)) {
      break;
    }

    if (isRecordOutputSchema(currentSubStep)) {
      const currentField = currentSubStep.fields[nextKey];
      if (isDefined(currentField)) {
        currentSubStep = currentField.value;
        nextKey = path[nextKeyIndex + 1];
        variablePathLabel = `${variablePathLabel} > ${currentField.label}`;
      } else {
        handleFieldNotFound();
      }
    } else if (isBaseOutputSchema(currentSubStep)) {
      if (isDefined(currentSubStep[nextKey])) {
        const currentField = currentSubStep[nextKey];
        currentSubStep = currentField.value;
        nextKey = path[nextKeyIndex + 1];
        variablePathLabel = `${variablePathLabel} > ${currentField.label}`;
      } else {
        handleFieldNotFound();
      }
    }
    nextKeyIndex++;
  }

  if (!isDefined(currentSubStep)) {
    return {
      variableLabel: undefined,
      variablePathLabel: undefined,
      variableType: undefined,
    };
  }

  return {
    variableLabel:
      isFullRecord && isRecordOutputSchema(currentSubStep)
        ? getDisplayedSubStepObjectLabel(currentSubStep)
        : getDisplayedSubStepFieldLabel(
            isSelectedFieldInNextKey ? nextKey : selectedField,
            currentSubStep,
          ),
    variablePathLabel,
    variableType: getVariableType(
      isSelectedFieldInNextKey ? nextKey : selectedField,
      currentSubStep,
    ),
  };
};

export const searchVariableThroughOutputSchema = ({
  stepOutputSchema,
  rawVariableName,
  isFullRecord = false,
}: {
  stepOutputSchema: StepOutputSchema;
  rawVariableName: string;
  isFullRecord?: boolean;
}) => {
  if (!isDefined(stepOutputSchema)) {
    return {
      variableLabel: undefined,
      variablePathLabel: undefined,
    };
  }

  const variableWithoutBrackets = rawVariableName.replace(
    CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX,
    (_, variableName) => {
      return variableName;
    },
  );

  const parts = variableWithoutBrackets.split('.');

  const stepId = parts.at(0);
  const selectedField = parts.at(-1);
  // path is the remaining parts of the variable name
  const path = parts.slice(1, -1);

  if (!isDefined(stepId) || !isDefined(selectedField)) {
    return {
      variableLabel: undefined,
      variablePathLabel: undefined,
    };
  }

  const { variableLabel, variablePathLabel, variableType } =
    searchCurrentStepOutputSchema({
      stepOutputSchema,
      path,
      isFullRecord,
      selectedField,
    });

  return {
    variableLabel,
    variablePathLabel: `${variablePathLabel} > ${variableLabel}`,
    variableType,
  };
};
