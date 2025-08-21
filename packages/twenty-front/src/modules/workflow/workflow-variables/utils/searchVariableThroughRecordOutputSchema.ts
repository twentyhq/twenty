import { CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX } from '@/workflow/workflow-variables/constants/CaptureAllVariableTagInnerRegex';
import { type VariableSearchResult } from '@/workflow/workflow-variables/hooks/useSearchVariable';
import {
  type RecordFieldNodeValue,
  type RecordOutputSchemaV2,
} from '@/workflow/workflow-variables/types/RecordOutputSchemaV2';
import { isRecordOutputSchemaV2 } from '@/workflow/workflow-variables/utils/isRecordOutputSchemaV2';
import { type FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const getRecordObjectLabel = (
  recordSchema: RecordOutputSchemaV2,
): string | undefined => {
  return recordSchema.object.label;
};

class FieldAccessor {
  static getLabel(
    fieldKey: string,
    schema: RecordFieldNodeValue,
  ): string | undefined {
    if (isRecordOutputSchemaV2(schema)) {
      return schema.fields[fieldKey]?.label;
    }
    return schema[fieldKey]?.label;
  }

  static getFieldMetadataId(
    fieldKey: string,
    schema: RecordFieldNodeValue,
  ): string | undefined {
    if (isRecordOutputSchemaV2(schema)) {
      return schema.fields[fieldKey]?.fieldMetadataId;
    }
    return schema[fieldKey]?.fieldMetadataId;
  }

  static getFieldMetadataType(
    fieldKey: string,
    schema: RecordFieldNodeValue,
  ): FieldMetadataType | undefined {
    if (isRecordOutputSchemaV2(schema)) {
      return schema.fields[fieldKey]?.type;
    }
    return schema[fieldKey]?.type;
  }

  static isCompositeSubField(
    fieldKey: string,
    schema: RecordFieldNodeValue,
  ): boolean {
    if (isRecordOutputSchemaV2(schema)) {
      return false; // Record schemas don't have composite sub-fields at the top level
    }
    return schema[fieldKey]?.isCompositeSubField ?? false;
  }

  static getFieldValue(
    fieldKey: string,
    schema: RecordFieldNodeValue,
  ): RecordFieldNodeValue | undefined {
    if (isRecordOutputSchemaV2(schema)) {
      return schema.fields[fieldKey]?.value;
    }
    return schema[fieldKey]?.value;
  }

  static hasField(fieldKey: string, schema: RecordFieldNodeValue): boolean {
    if (isRecordOutputSchemaV2(schema)) {
      return isDefined(schema.fields[fieldKey]);
    }
    return isDefined(schema[fieldKey]);
  }
}

const navigateToTargetField = (
  startingSchema: RecordOutputSchemaV2,
  pathSegments: string[],
): { schema: RecordFieldNodeValue; pathLabels: string[] } | null => {
  let currentSchema: RecordFieldNodeValue = startingSchema;
  const pathLabels: string[] = [];

  for (const pathSegment of pathSegments) {
    if (
      !isDefined(currentSchema) ||
      !FieldAccessor.hasField(pathSegment, currentSchema)
    ) {
      return null; // Path not found
    }

    const fieldLabel = FieldAccessor.getLabel(pathSegment, currentSchema);
    if (isDefined(fieldLabel)) {
      pathLabels.push(fieldLabel);
    }

    const nextSchema = FieldAccessor.getFieldValue(pathSegment, currentSchema);
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
): VariableSearchResult => {
  // Determine the variable label based on whether we want the full record or a specific field
  const variableLabel =
    isFullRecord && isRecordOutputSchemaV2(targetSchema)
      ? getRecordObjectLabel(targetSchema)
      : FieldAccessor.getLabel(targetFieldName, targetSchema);

  if (!variableLabel) {
    return {
      variableLabel: undefined,
      variablePathLabel: undefined,
      variableType: undefined,
    };
  }

  // Build the full path: stepName > field1 > field2 > targetField
  const fullPathSegments = [stepName, ...pathLabels, variableLabel];
  const variablePathLabel = fullPathSegments.join(' > ');

  return {
    variableLabel,
    variablePathLabel,
    variableType: FieldAccessor.getFieldMetadataType(
      targetFieldName,
      targetSchema,
    ),
    fieldMetadataId: FieldAccessor.getFieldMetadataId(
      targetFieldName,
      targetSchema,
    ),
    compositeFieldSubFieldName: FieldAccessor.isCompositeSubField(
      targetFieldName,
      targetSchema,
    )
      ? targetFieldName
      : undefined,
  };
};

const searchCurrentStepOutputSchema = ({
  stepName,
  recordOutputSchema,
  path,
  selectedField,
  isFullRecord,
}: {
  stepName: string;
  recordOutputSchema: RecordOutputSchemaV2;
  path: string[];
  selectedField: string;
  isFullRecord: boolean;
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

  return searchCurrentStepOutputSchema({
    stepName,
    recordOutputSchema,
    selectedField: fieldName,
    path: pathSegments,
    isFullRecord,
  });
};
