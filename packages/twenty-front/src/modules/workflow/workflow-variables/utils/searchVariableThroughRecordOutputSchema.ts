import { type VariableSearchResult } from '@/workflow/workflow-variables/hooks/useSearchVariable';
import {
  type FieldOutputSchemaV2,
  type RecordFieldNodeValue,
  type RecordOutputSchemaV2,
} from '@/workflow/workflow-variables/types/RecordOutputSchemaV2';
import { isRecordOutputSchemaV2 } from '@/workflow/workflow-variables/types/guards/isRecordOutputSchemaV2';
import { isDefined } from 'twenty-shared/utils';
import { CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX } from 'twenty-shared/workflow';

const getRecordObjectLabel = (
  recordSchema: RecordOutputSchemaV2,
): string | undefined => {
  return recordSchema.object.label;
};

const getFieldFromSchema = (
  fieldKey: string,
  recordSchema: RecordFieldNodeValue,
): FieldOutputSchemaV2 | undefined => {
  return isRecordOutputSchemaV2(recordSchema)
    ? recordSchema.fields[fieldKey]
    : recordSchema[fieldKey];
};

const getCompositeSubFieldName = (
  recordSchema: RecordFieldNodeValue,
  fieldKey: string,
): string | undefined => {
  return isRecordOutputSchemaV2(recordSchema)
    ? undefined
    : recordSchema[fieldKey]?.isCompositeSubField
      ? fieldKey
      : undefined;
};

const isIdFieldName = (fieldName: string) => {
  return (
    fieldName === 'id' ||
    // For database events, id field will have a prefix such as properties.after.id
    fieldName.endsWith('.id')
  );
};

const navigateToTargetField = (
  startingSchema: RecordOutputSchemaV2,
  pathSegments: string[],
): { schema: RecordFieldNodeValue; pathLabels: string[] } | null => {
  let currentSchema: RecordFieldNodeValue = startingSchema;
  const pathLabels: string[] = [];

  for (const pathSegment of pathSegments) {
    const field = getFieldFromSchema(pathSegment, currentSchema);

    if (!isDefined(field)) {
      return null; // Path not found
    }

    if (isDefined(field.label)) {
      pathLabels.push(field.label);
    }

    const nextSchema = field.value;
    if (!isDefined(nextSchema)) {
      return null; // Dead end in path
    }

    currentSchema = nextSchema;
  }

  return { schema: currentSchema, pathLabels };
};

const buildVariableResult = (
  stepName: string,
  pathLabels: string[],
  targetSchema: RecordFieldNodeValue,
  targetFieldName: string,
  isFullRecord: boolean,
  stepNameLabel?: string,
): VariableSearchResult => {
  const targetField = getFieldFromSchema(targetFieldName, targetSchema);
  // Determine the variable label based on whether we want the full record or a specific field
  const variableLabel =
    isFullRecord &&
    isRecordOutputSchemaV2(targetSchema) &&
    isIdFieldName(targetFieldName)
      ? getRecordObjectLabel(targetSchema)
      : targetField?.label;

  if (!variableLabel) {
    return {
      variableLabel: undefined,
      variablePathLabel: undefined,
      variableType: undefined,
    };
  }

  // Build the full path: stepName > field1 > field2 > targetField
  const fullPathSegments = [stepName, ...pathLabels, variableLabel];
  const basePath = fullPathSegments.join(' > ');
  const variablePathLabel = stepNameLabel
    ? `${basePath} (${stepNameLabel})`
    : basePath;

  return {
    variableLabel,
    variablePathLabel,
    variableType: targetField?.type,
    fieldMetadataId: targetField?.fieldMetadataId,
    compositeFieldSubFieldName: getCompositeSubFieldName(
      targetSchema,
      targetFieldName,
    ),
  };
};

export const searchRecordOutputSchema = ({
  stepName,
  recordOutputSchema,
  path,
  selectedField,
  isFullRecord,
  stepNameLabel,
}: {
  stepName: string;
  recordOutputSchema: RecordOutputSchemaV2;
  path: string[];
  selectedField: string;
  isFullRecord: boolean;
  stepNameLabel?: string;
}): VariableSearchResult => {
  const navigationResult = navigateToTargetField(recordOutputSchema, path);

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
    isFullRecord,
    stepNameLabel,
  );
};

/**
 * Parses a variable name to extract its components
 * Example: "{{step1.user.name}}" -> { stepId: "step1", pathSegments: ["user"], fieldName: "name" }
 */
const parseVariableName = (rawVariableName: string) => {
  const variableWithoutBrackets = rawVariableName.replace(
    CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX,
    (_, variableName) => variableName,
  );

  const parts = variableWithoutBrackets.split('.');

  return {
    stepId: parts.at(0),
    fieldName: parts.at(-1),
    pathSegments: parts.slice(1, -1), // Everything between stepId and fieldName
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
export const searchVariableThroughRecordOutputSchema = ({
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
