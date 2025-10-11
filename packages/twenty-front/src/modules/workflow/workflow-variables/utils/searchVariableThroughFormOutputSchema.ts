import { type VariableSearchResult } from '@/workflow/workflow-variables/hooks/useSearchVariable';
import type { FormOutputSchema } from '@/workflow/workflow-variables/types/FormOutputSchema';
import { searchRecordOutputSchema } from '@/workflow/workflow-variables/utils/searchVariableThroughRecordOutputSchema';
import { isDefined } from 'twenty-shared/utils';
import { CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX } from 'twenty-shared/workflow';

/**
 * Parses a variable name to extract its components for Form outputs
 * Example: "{{step1.fieldName}}" -> { stepId: "step1", fieldName: "fieldName", pathSegments: [] }
 * Example: "{{step1.recordField.user.name}}" -> { stepId: "step1", fieldName: "recordField", pathSegments: ["user"], recordFieldName: "name" }
 */
const parseVariableName = (rawVariableName: string) => {
  const variableWithoutBrackets = rawVariableName.replace(
    CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX,
    (_, variableName) => variableName,
  );

  const parts = variableWithoutBrackets.split('.');
  const stepId = parts.at(0);
  const fieldName = parts.at(1);
  const remainingParts = parts.slice(2);

  return {
    stepId,
    fieldName,
    pathSegments: remainingParts.slice(0, -1),
    recordFieldName: remainingParts.at(-1),
  };
};

/**
 * Searches for a variable within a form output schema and returns its metadata
 *
 * @param stepName - Display name of the workflow step
 * @param formOutputSchema - The form schema to search within
 * @param rawVariableName - Variable name like "{{step1.fieldName}}" or "step1.recordField.user.name"
 * @param isFullRecord - Whether to return info for the entire record vs specific field
 * @returns Variable metadata including labels, types, and field information
 */
export const searchVariableThroughFormOutputSchema = ({
  stepName,
  formOutputSchema,
  rawVariableName,
  isFullRecord = false,
}: {
  stepName: string;
  formOutputSchema: FormOutputSchema;
  rawVariableName: string;
  isFullRecord?: boolean;
}): VariableSearchResult => {
  if (!isDefined(formOutputSchema)) {
    return {
      variableLabel: undefined,
      variablePathLabel: undefined,
    };
  }

  const { stepId, fieldName, pathSegments, recordFieldName } =
    parseVariableName(rawVariableName);

  if (!isDefined(stepId) || !isDefined(fieldName)) {
    return {
      variableLabel: undefined,
      variablePathLabel: undefined,
    };
  }

  const formField = formOutputSchema[fieldName];

  if (!isDefined(formField)) {
    return {
      variableLabel: undefined,
      variablePathLabel: undefined,
    };
  }

  if (formField.isLeaf) {
    return {
      variableLabel: formField.label,
      variablePathLabel: `${stepName} > ${formField.label}`,
      variableType: formField.type,
    };
  }

  if (!formField.isLeaf && isDefined(recordFieldName)) {
    return searchRecordOutputSchema({
      stepName: `${stepName} > ${formField.label}`,
      recordOutputSchema: formField.value,
      selectedField: recordFieldName,
      path: pathSegments,
      isFullRecord,
    });
  }

  return {
    variableLabel: undefined,
    variablePathLabel: undefined,
  };
};
