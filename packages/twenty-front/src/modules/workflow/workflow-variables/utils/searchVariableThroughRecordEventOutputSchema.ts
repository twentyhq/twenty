import { type VariableSearchResult } from '@/workflow/workflow-variables/hooks/useSearchVariable';
import { type RecordOutputSchemaV2 } from '@/workflow/workflow-variables/types/RecordOutputSchemaV2';
import { searchRecordOutputSchema } from '@/workflow/workflow-variables/utils/searchVariableThroughRecordOutputSchema';
import { isDefined } from 'twenty-shared/utils';
import { CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX } from 'twenty-shared/workflow';

/**
 * Parses a variable name to extract its components
 * Example: "{{step1.properties.after.user.name}}" -> { stepId: "step1", eventPrefix: "properties.after", pathSegments: ["user"], fieldName: "name" }
 */
const parseVariableName = (rawVariableName: string) => {
  const variableWithoutBrackets = rawVariableName.replace(
    CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX,
    (_, variableName) => variableName,
  );

  const parts = variableWithoutBrackets.split('.');
  const stepId = parts.at(0);
  // after stepId, we have a prefix (properties.after or properties.before). Path segments are the rest of the string
  // join the first 3 parts to get the event prefix
  const firstFieldWithEventPrefix = parts.slice(1, 4).join('.');
  const remainingParts = parts.slice(4);
  const partsWithoutStepId = [firstFieldWithEventPrefix, ...remainingParts];

  return {
    stepId,
    fieldName: partsWithoutStepId.at(-1),
    pathSegments: partsWithoutStepId.slice(0, -1),
  };
};

/**
 * Searches for a variable within a record output schema and returns its metadata
 *
 * @param stepName - Display name of the workflow step
 * @param recordOutputSchema - The schema to search within
 * @param rawVariableName - Variable name like "{{step1.user.name}}" or "step1.user.name"
 * @param isFullRecord - Whether to return info for the entire record vs specific field
 * @returns Variable metadata including labels, types, and field information
 */
export const searchVariableThroughRecordEventOutputSchema = ({
  stepName,
  recordOutputSchema,
  rawVariableName,
  isFullRecord = false,
}: {
  stepName: string;
  recordOutputSchema: RecordOutputSchemaV2;
  rawVariableName: string;
  isFullRecord?: boolean;
}): VariableSearchResult => {
  if (!isDefined(recordOutputSchema)) {
    return {
      variableLabel: undefined,
      variablePathLabel: undefined,
    };
  }

  const { stepId, fieldName, pathSegments } =
    parseVariableName(rawVariableName);

  if (!isDefined(stepId) || !isDefined(fieldName)) {
    return {
      variableLabel: undefined,
      variablePathLabel: undefined,
    };
  }

  return searchRecordOutputSchema({
    stepName,
    recordOutputSchema,
    selectedField: fieldName,
    path: pathSegments,
    isFullRecord,
  });
};
