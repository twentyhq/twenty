import { type VariableSearchResult } from '@/workflow/workflow-variables/hooks/useSearchVariable';
import type { FindRecordsOutputSchema } from '@/workflow/workflow-variables/types/FindRecordsOutputSchema';
import { searchRecordOutputSchema as searchRecordOutputSchemaUtil } from '@/workflow/workflow-variables/utils/searchVariableThroughRecordOutputSchema';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX } from 'twenty-shared/workflow';

type SearchResultKey = 'first' | 'all' | 'totalCount';

/**
 * Parses a variable name to extract its components for SearchRecord outputs
 * Example: "{{step1.first.user.name}}" -> { stepId: "step1", searchResultKey: "first", pathSegments: ["user"], fieldName: "name" }
 * Example: "{{step1.totalCount}}" -> { stepId: "step1", searchResultKey: "totalCount", pathSegments: [], fieldName: undefined }
 */
const parseVariableName = (rawVariableName: string) => {
  const variableWithoutBrackets = rawVariableName.replace(
    CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX,
    (_, variableName) => variableName,
  );

  const parts = variableWithoutBrackets.split('.');
  const stepId = parts.at(0);
  const searchResultKey = parts.at(1) as SearchResultKey;
  const remainingParts = parts.slice(2);

  return {
    stepId,
    searchResultKey,
    fieldName: remainingParts.at(-1),
    pathSegments: remainingParts.slice(0, -1),
  };
};

/**
 * Searches for a variable within a search record output schema and returns its metadata
 *
 * @param stepName - Display name of the workflow step
 * @param searchRecordOutputSchema - The search record schema to search within
 * @param rawVariableName - Variable name like "{{step1.first.user.name}}" or "step1.totalCount"
 * @param isFullRecord - Whether to return info for the entire record vs specific field
 * @returns Variable metadata including labels, types, and field information
 */
export const searchVariableThroughFindRecordsOutputSchema = ({
  stepName,
  searchRecordOutputSchema,
  rawVariableName,
  isFullRecord = false,
}: {
  stepName: string;
  searchRecordOutputSchema: FindRecordsOutputSchema;
  rawVariableName: string;
  isFullRecord?: boolean;
}): VariableSearchResult => {
  if (!isDefined(searchRecordOutputSchema)) {
    return {
      variableLabel: undefined,
      variablePathLabel: undefined,
    };
  }

  const { stepId, searchResultKey, fieldName, pathSegments } =
    parseVariableName(rawVariableName);

  if (!isDefined(stepId) || !isDefined(searchResultKey)) {
    return {
      variableLabel: undefined,
      variablePathLabel: undefined,
    };
  }

  if (searchResultKey === 'first') {
    const recordSchema = searchRecordOutputSchema[searchResultKey]?.value;

    if (!isDefined(recordSchema) || !isDefined(fieldName)) {
      return {
        variableLabel: undefined,
        variablePathLabel: undefined,
      };
    }

    return searchRecordOutputSchemaUtil({
      stepName: `${stepName} > ${searchRecordOutputSchema[searchResultKey]?.label ?? 'First'}`,
      recordOutputSchema: recordSchema,
      selectedField: fieldName,
      path: pathSegments,
      isFullRecord,
    });
  }

  if (searchResultKey === 'totalCount') {
    return {
      variableLabel:
        searchRecordOutputSchema[searchResultKey]?.label ?? 'Total Count',
      variablePathLabel: `${stepName} > ${searchRecordOutputSchema[searchResultKey]?.label ?? 'Total Count'}`,
      variableType: FieldMetadataType.NUMBER,
    };
  }

  if (searchResultKey === 'all') {
    return {
      variableLabel:
        searchRecordOutputSchema[searchResultKey]?.label ?? 'All Records',
      variablePathLabel: `${stepName} > ${searchRecordOutputSchema[searchResultKey]?.label ?? 'All Records'}`,
      variableType: FieldMetadataType.ARRAY,
    };
  }

  return {
    variableLabel: undefined,
    variablePathLabel: undefined,
  };
};
