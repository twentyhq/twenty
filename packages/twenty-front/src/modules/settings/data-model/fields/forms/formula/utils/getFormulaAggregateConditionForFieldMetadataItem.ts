import { isNonEmptyString } from '@sniptt/guards';
import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FORMULA_AGGREGATE_CONDITION_OPERANDS_BY_FIELD_METADATA_TYPE } from '@/settings/data-model/fields/forms/formula/constants/FormulaAggregateConditionOperandsByFieldMetadataType';
import { type FormulaAggregateCondition } from '@/settings/data-model/fields/forms/formula/types/FormulaAggregateCondition';

const getDefaultConditionValue = (
  fieldMetadataItem: Pick<FieldMetadataItem, 'type' | 'options'>,
): string => {
  if (fieldMetadataItem.type === FieldMetadataType.BOOLEAN) {
    return 'true';
  }

  if (
    fieldMetadataItem.type !== FieldMetadataType.SELECT &&
    fieldMetadataItem.type !== FieldMetadataType.MULTI_SELECT
  ) {
    return '';
  }

  const firstOptionValue = fieldMetadataItem.options?.[0]?.value;

  return isNonEmptyString(firstOptionValue) ? firstOptionValue : '';
};

export const getFormulaAggregateConditionForFieldMetadataItem = ({
  conditionId,
  fieldMetadataItem,
}: {
  conditionId: string;
  fieldMetadataItem: Pick<FieldMetadataItem, 'name' | 'type' | 'options'>;
}): FormulaAggregateCondition => {
  const [operand = ViewFilterOperand.IS] =
    FORMULA_AGGREGATE_CONDITION_OPERANDS_BY_FIELD_METADATA_TYPE[
      fieldMetadataItem.type
    ] ?? [];

  return {
    id: conditionId,
    fieldName: fieldMetadataItem.name,
    operand,
    value: getDefaultConditionValue(fieldMetadataItem),
  };
};
