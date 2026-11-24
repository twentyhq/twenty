import { isNonEmptyString } from '@sniptt/guards';
import { doNotTranslate } from 'twenty-shared/i18n';
import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FORMULA_AGGREGATE_CONDITION_OPERANDS_BY_FIELD_METADATA_TYPE } from '@/settings/data-model/fields/forms/formula/constants/FormulaAggregateConditionOperandsByFieldMetadataType';
import { type FormulaAggregateBuilderState } from '@/settings/data-model/fields/forms/formula/types/FormulaAggregateBuilderState';
import { type FormulaAggregateCondition } from '@/settings/data-model/fields/forms/formula/types/FormulaAggregateCondition';

type RelatedFieldMetadataItem = Pick<FieldMetadataItem, 'name' | 'type'>;

const COMPARISON_OPERATORS_BY_OPERAND: Partial<
  Record<ViewFilterOperand, string>
> = {
  [ViewFilterOperand.IS]: '==',
  [ViewFilterOperand.IS_NOT]: '!=',
  [ViewFilterOperand.GREATER_THAN_OR_EQUAL]: '>=',
  [ViewFilterOperand.LESS_THAN_OR_EQUAL]: '<=',
};

const toFormulaStringLiteral = (value: string): string =>
  `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

// The expression language reads no exponent, so 1e21 is written out in full
const toFormulaNumberLiteral = (value: string): string | undefined => {
  const trimmedValue = value.trim();
  const number = Number(trimmedValue);

  if (!isNonEmptyString(trimmedValue) || !Number.isFinite(number)) {
    return undefined;
  }

  const numberAsString = String(number);

  return numberAsString.includes('e')
    ? number.toLocaleString('en-US', {
        useGrouping: false,
        maximumSignificantDigits: 15,
      })
    : numberAsString;
};

const toFormulaLiteral = ({
  fieldType,
  value,
}: {
  fieldType: FieldMetadataType;
  value: string;
}): string | undefined => {
  switch (fieldType) {
    case FieldMetadataType.BOOLEAN:
      return value === 'true' || value === 'false' ? value : undefined;
    case FieldMetadataType.NUMBER:
      return toFormulaNumberLiteral(value);
    case FieldMetadataType.SELECT:
    case FieldMetadataType.MULTI_SELECT:
      return isNonEmptyString(value)
        ? toFormulaStringLiteral(value)
        : undefined;
    default:
      return toFormulaStringLiteral(value);
  }
};

const buildConditionExpression = ({
  relationFieldName,
  condition,
  relatedFieldMetadataItems,
}: {
  relationFieldName: string;
  condition: FormulaAggregateCondition;
  relatedFieldMetadataItems: RelatedFieldMetadataItem[];
}): string | undefined => {
  const fieldMetadataItem = relatedFieldMetadataItems.find(
    ({ name }) => name === condition.fieldName,
  );

  if (
    !isDefined(fieldMetadataItem) ||
    !FORMULA_AGGREGATE_CONDITION_OPERANDS_BY_FIELD_METADATA_TYPE[
      fieldMetadataItem.type
    ]?.includes(condition.operand)
  ) {
    return undefined;
  }

  const path = `${relationFieldName}.${fieldMetadataItem.name}`;

  if (condition.operand === ViewFilterOperand.IS_EMPTY) {
    return doNotTranslate(`isEmpty(${path})`);
  }

  // Not isDefined: an empty text is stored as "", which isDefined accepts
  if (condition.operand === ViewFilterOperand.IS_NOT_EMPTY) {
    return doNotTranslate(`not isEmpty(${path})`);
  }

  const literal = toFormulaLiteral({
    fieldType: fieldMetadataItem.type,
    value: condition.value,
  });

  if (!isDefined(literal)) {
    return undefined;
  }

  if (condition.operand === ViewFilterOperand.CONTAINS) {
    return doNotTranslate(`includes(${path}, ${literal})`);
  }

  if (condition.operand === ViewFilterOperand.DOES_NOT_CONTAIN) {
    return doNotTranslate(`not includes(${path}, ${literal})`);
  }

  const comparisonOperator = COMPARISON_OPERATORS_BY_OPERAND[condition.operand];

  return isDefined(comparisonOperator)
    ? `${path} ${comparisonOperator} ${literal}`
    : undefined;
};

const buildAggregatedPath = ({
  relationFieldName,
  aggregatedFieldName,
  relatedFieldMetadataItems,
}: {
  relationFieldName: string;
  aggregatedFieldName?: string;
  relatedFieldMetadataItems: RelatedFieldMetadataItem[];
}): string | undefined => {
  const fieldMetadataItem = relatedFieldMetadataItems.find(
    ({ name }) => name === aggregatedFieldName,
  );

  if (!isDefined(fieldMetadataItem)) {
    return undefined;
  }

  return fieldMetadataItem.type === FieldMetadataType.CURRENCY
    ? `${relationFieldName}.${fieldMetadataItem.name}.amountMicros`
    : `${relationFieldName}.${fieldMetadataItem.name}`;
};

// Incomplete conditions are left out; undefined when the aggregate itself is incomplete
export const buildFormulaAggregateExpression = ({
  builderState: {
    relationFieldName,
    functionName,
    aggregatedFieldName,
    conditions,
  },
  relatedFieldMetadataItems,
}: {
  builderState: FormulaAggregateBuilderState;
  relatedFieldMetadataItems: RelatedFieldMetadataItem[];
}): string | undefined => {
  if (!isNonEmptyString(relationFieldName)) {
    return undefined;
  }

  const firstArgument =
    functionName === 'count'
      ? relationFieldName
      : buildAggregatedPath({
          relationFieldName,
          aggregatedFieldName,
          relatedFieldMetadataItems,
        });

  if (!isDefined(firstArgument)) {
    return undefined;
  }

  const conditionExpressions = conditions
    .map((condition) =>
      buildConditionExpression({
        relationFieldName,
        condition,
        relatedFieldMetadataItems,
      }),
    )
    .filter(isDefined);

  const functionArguments =
    conditionExpressions.length > 0
      ? [firstArgument, conditionExpressions.join(' and ')]
      : [firstArgument];

  return `${functionName}(${functionArguments.join(', ')})`;
};
