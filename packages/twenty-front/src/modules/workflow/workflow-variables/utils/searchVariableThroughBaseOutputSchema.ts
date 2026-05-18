import { type VariableSearchResult } from '@/workflow/workflow-variables/hooks/useSearchVariable';
import { reportInvalidVariableSchemaTraversal } from '@/workflow/workflow-variables/utils/reportInvalidVariableSchemaTraversal';
import { isDefined } from 'twenty-shared/utils';
import {
  CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX,
  parseVariablePath,
  type BaseOutputSchemaV2,
} from 'twenty-shared/workflow';

/**
 * Parses a variable name to extract its components
 * Example: "{{step1.field.value}}" -> { stepId: "step1", pathSegments: ["field"], targetFieldName: "value" }
 */
const parseVariableName = (rawVariableName: string) => {
  const variableWithoutBrackets = rawVariableName.replace(
    CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX,
    (_, variableName) => variableName,
  );

  const parts = parseVariablePath(variableWithoutBrackets);
  const stepId = parts.at(0);

  return {
    stepId,
    targetFieldName: parts.at(-1),
    pathSegments: parts.slice(1, -1),
  };
};

const navigateToTargetField = ({
  startingSchema,
  pathSegments,
  stepName,
  rawVariableName,
}: {
  startingSchema: BaseOutputSchemaV2;
  pathSegments: string[];
  stepName: string;
  rawVariableName: string;
}): { schema: BaseOutputSchemaV2; pathLabels: string[] } | null => {
  let currentSchema: BaseOutputSchemaV2 = startingSchema;
  const pathLabels: string[] = [];

  for (const pathSegment of pathSegments) {
    const field = currentSchema[pathSegment];

    if (!isDefined(field) || field.isLeaf === true) {
      return null;
    }

    if (
      !isDefined(field.value) ||
      typeof field.value !== 'object' ||
      Array.isArray(field.value)
    ) {
      reportInvalidVariableSchemaTraversal({
        stepName,
        rawVariableName,
        pathSegment,
      });

      return null;
    }

    pathLabels.push(field.label);
    currentSchema = field.value;
  }

  return { schema: currentSchema, pathLabels };
};

const buildVariableResult = (
  stepName: string,
  pathLabels: string[],
  targetSchema: BaseOutputSchemaV2,
  targetFieldName: string,
): VariableSearchResult => {
  const targetField = targetSchema[targetFieldName];

  if (!isDefined(targetField)) {
    return {
      variableLabel: undefined,
      variablePathLabel: undefined,
    };
  }

  // Build the full path: stepName > field1 > field2 > targetField
  const fullPathSegments = [stepName, ...pathLabels, targetField.label];
  const variablePathLabel = fullPathSegments.join(' > ');

  return {
    variableLabel: targetField.label,
    variablePathLabel,
    variableType: targetField.type,
  };
};

export const searchBaseOutputSchema = ({
  stepName,
  baseOutputSchema,
  path,
  selectedField,
  rawVariableName,
}: {
  stepName: string;
  baseOutputSchema: BaseOutputSchemaV2;
  path: string[];
  selectedField: string;
  rawVariableName?: string;
}): VariableSearchResult => {
  const navigationResult = navigateToTargetField({
    startingSchema: baseOutputSchema,
    pathSegments: path,
    stepName,
    rawVariableName:
      rawVariableName ?? `${stepName}.${path.join('.')}.${selectedField}`,
  });

  if (!navigationResult) {
    return {
      variableLabel: undefined,
      variablePathLabel: undefined,
      variableType: undefined,
    };
  }

  return buildVariableResult(
    stepName,
    navigationResult.pathLabels,
    navigationResult.schema,
    selectedField,
  );
};

/**
 * Searches for a variable within a base output schema and returns its metadata
 *
 * @param stepName - Display name of the workflow step
 * @param baseOutputSchema - The base schema to search within
 * @param rawVariableName - Variable name like "{{step1.fieldName}}" or "step1.object.nested.value"
 * @param isFullRecord - Whether to return info for the entire record vs specific field (not used for base schema)
 * @returns Variable metadata including labels, types, and field information
 */
export const searchVariableThroughBaseOutputSchema = ({
  stepName,
  baseOutputSchema,
  rawVariableName,
}: {
  stepName: string;
  baseOutputSchema: BaseOutputSchemaV2;
  rawVariableName: string;
}): VariableSearchResult => {
  if (!isDefined(baseOutputSchema)) {
    return {
      variableLabel: undefined,
      variablePathLabel: undefined,
    };
  }

  const { stepId, pathSegments, targetFieldName } =
    parseVariableName(rawVariableName);

  if (!isDefined(stepId) || !isDefined(targetFieldName)) {
    return {
      variableLabel: undefined,
      variablePathLabel: undefined,
    };
  }

  const navigationResult = navigateToTargetField({
    startingSchema: baseOutputSchema,
    pathSegments,
    stepName,
    rawVariableName,
  });

  if (!navigationResult) {
    return {
      variableLabel: undefined,
      variablePathLabel: undefined,
      variableType: undefined,
    };
  }

  return buildVariableResult(
    stepName,
    navigationResult.pathLabels,
    navigationResult.schema,
    targetFieldName,
  );
};
