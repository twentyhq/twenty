import { type VariableSearchResult } from '@/workflow/workflow-variables/hooks/useSearchVariable';
import { isBaseOutputSchemaV2 } from '@/workflow/workflow-variables/types/guards/isBaseOutputSchemaV2';
import { isRecordOutputSchemaV2 } from '@/workflow/workflow-variables/types/guards/isRecordOutputSchemaV2';
import { type IteratorOutputSchema } from '@/workflow/workflow-variables/types/IteratorOutputSchema';
import { searchBaseOutputSchema } from '@/workflow/workflow-variables/utils/searchVariableThroughBaseOutputSchema';
import { searchRecordOutputSchema } from '@/workflow/workflow-variables/utils/searchVariableThroughRecordOutputSchema';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX } from 'twenty-shared/workflow';

type IteratorResultKey =
  | 'currentItem'
  | 'currentItemIndex'
  | 'hasProcessedAllItems';

const parseVariableName = (rawVariableName: string) => {
  const variableWithoutBrackets = rawVariableName.replace(
    CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX,
    (_, variableName) => variableName,
  );

  const parts = variableWithoutBrackets.split('.');
  const stepId = parts.at(0);
  const iteratorResultKey = parts.at(1) as IteratorResultKey;
  const remainingParts = parts.slice(2);

  return {
    stepId,
    iteratorResultKey,
    fieldName: remainingParts.at(-1),
    pathSegments: remainingParts.slice(0, -1),
  };
};

export const searchVariableThroughIteratorOutputSchema = ({
  stepName,
  iteratorOutputSchema,
  rawVariableName,
  isFullRecord = false,
}: {
  stepName: string;
  iteratorOutputSchema: IteratorOutputSchema;
  rawVariableName: string;
  isFullRecord?: boolean;
}): VariableSearchResult => {
  if (!isDefined(iteratorOutputSchema)) {
    return {
      variableLabel: undefined,
      variablePathLabel: undefined,
    };
  }

  const { stepId, iteratorResultKey, fieldName, pathSegments } =
    parseVariableName(rawVariableName);

  if (!isDefined(stepId) || !isDefined(iteratorResultKey)) {
    return {
      variableLabel: undefined,
      variablePathLabel: undefined,
    };
  }

  if (iteratorResultKey === 'currentItemIndex') {
    return {
      variableLabel: 'Current Item Index',
      variablePathLabel: `${stepName} > Current Item Index`,
      variableType: FieldMetadataType.NUMBER,
    };
  }

  if (iteratorResultKey === 'hasProcessedAllItems') {
    return {
      variableLabel: 'Has Processed All Items',
      variablePathLabel: `${stepName} > Has Processed All Items`,
      variableType: FieldMetadataType.BOOLEAN,
    };
  }

  if (iteratorResultKey === 'currentItem') {
    const schema = iteratorOutputSchema.currentItem.value;

    if (!isDefined(schema)) {
      return {
        variableLabel: undefined,
        variablePathLabel: undefined,
      };
    }

    if (isRecordOutputSchemaV2(schema) && isDefined(fieldName)) {
      return searchRecordOutputSchema({
        stepName: `${stepName} > Current Item`,
        recordOutputSchema: schema,
        path: pathSegments,
        selectedField: fieldName,
        isFullRecord,
      });
    }

    if (isBaseOutputSchemaV2(schema) && isDefined(fieldName)) {
      return searchBaseOutputSchema({
        stepName,
        baseOutputSchema: schema,
        path: pathSegments,
        selectedField: fieldName,
      });
    }

    return {
      variableLabel: iteratorOutputSchema.currentItem.label,
      variablePathLabel: `${stepName} > ${iteratorOutputSchema.currentItem.label}`,
      variableType: iteratorOutputSchema.currentItem.isLeaf
        ? iteratorOutputSchema.currentItem.type
        : 'unknown',
    };
  }

  return {
    variableLabel: undefined,
    variablePathLabel: undefined,
  };
};
