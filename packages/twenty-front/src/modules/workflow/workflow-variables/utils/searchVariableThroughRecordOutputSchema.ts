import { CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX } from '@/workflow/workflow-variables/constants/CaptureAllVariableTagInnerRegex';
import {
  type FieldLeaf,
  type FieldNode,
  type RecordOutputSchema,
} from '@/workflow/workflow-variables/types/StepOutputSchema';
import { isRecordOutputSchema } from '@/workflow/workflow-variables/utils/isRecordOutputSchema';
import { isDefined } from 'twenty-shared/utils';

type VariableInfo = {
  fieldMetadataId: string | undefined;
  compositeFieldSubFieldName?: string | undefined;
  label?: string | undefined;
  pathLabel?: string | undefined;
};

const searchCurrentStepRecordOutputSchema = ({
  recordOutputSchema,
  path,
}: {
  recordOutputSchema: RecordOutputSchema;
  path: string[];
}): VariableInfo => {
  let currentField: RecordOutputSchema | FieldLeaf | FieldNode | undefined =
    recordOutputSchema;
  let currentKeyIndex = 0;
  let currentKey = path[currentKeyIndex];

  console.log('path', path);

  while (currentKeyIndex < path.length) {
    if (!isDefined(currentField)) {
      return {
        fieldMetadataId: undefined,
      };
    }

    if (isRecordOutputSchema(currentField)) {
      currentField = currentField.fields[currentKey];
    } else {
      currentField = currentField[currentKey];
    }

    currentKeyIndex++;
  }

  console.log('currentField', currentField);

  if (isRecordOutputSchema(currentField)) {
    return {
      fieldMetadataId: undefined,
    };
  }

  if (currentField.isLeaf) {
    return {
      fieldMetadataId: currentField.fieldMetadataId,
      compositeFieldSubFieldName: currentField.isCompositeSubField
        ? currentKey
        : undefined,
      label: currentField.label,
      pathLabel: currentField.label,
    };
  }

  return {
    fieldMetadataId: currentField.fieldMetadataId,
    compositeFieldSubFieldName: undefined,
    label: currentField.label,
    pathLabel: currentField.label,
  };
};

export const searchVariableThroughRecordOutputSchema = ({
  recordOutputSchema,
  rawVariableName,
}: {
  recordOutputSchema: RecordOutputSchema;
  rawVariableName: string;
}): VariableInfo => {
  if (!isDefined(recordOutputSchema)) {
    return {
      fieldMetadataId: undefined,
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
  // path is the remaining parts of the variable name
  const path = parts.slice(1);

  if (!isDefined(stepId) || !isDefined(path)) {
    return {
      fieldMetadataId: undefined,
    };
  }

  return searchCurrentStepRecordOutputSchema({
    recordOutputSchema,
    path,
  });
};
