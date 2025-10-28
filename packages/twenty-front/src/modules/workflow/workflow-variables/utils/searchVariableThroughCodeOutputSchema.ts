import { type VariableSearchResult } from '@/workflow/workflow-variables/hooks/useSearchVariable';
import type { CodeOutputSchema } from '@/workflow/workflow-variables/types/CodeOutputSchema';
import { searchVariableThroughBaseOutputSchema } from '@/workflow/workflow-variables/utils/searchVariableThroughBaseOutputSchema';
import { isDefined } from 'twenty-shared/utils';

const isLinkOutputSchema = (
  codeOutputSchema: CodeOutputSchema,
): codeOutputSchema is { link: any; _outputSchemaType: 'LINK' } => {
  return (
    isDefined(codeOutputSchema) && codeOutputSchema._outputSchemaType === 'LINK'
  );
};

/**
 * Searches for a variable within a code output schema and returns its metadata
 *
 * @param stepName - Display name of the workflow step
 * @param codeOutputSchema - The code schema to search within
 * @param rawVariableName - Variable name like "{{step1.fieldName}}" or "step1.link"
 * @param isFullRecord - Whether to return info for the entire record vs specific field
 * @returns Variable metadata including labels, types, and field information
 */
export const searchVariableThroughCodeOutputSchema = ({
  stepName,
  codeOutputSchema,
  rawVariableName,
}: {
  stepName: string;
  codeOutputSchema: CodeOutputSchema;
  rawVariableName: string;
}): VariableSearchResult => {
  if (!isDefined(codeOutputSchema) || isLinkOutputSchema(codeOutputSchema)) {
    return {
      variableLabel: undefined,
      variablePathLabel: undefined,
    };
  }

  return searchVariableThroughBaseOutputSchema({
    stepName,
    baseOutputSchema: codeOutputSchema,
    rawVariableName,
  });
};
