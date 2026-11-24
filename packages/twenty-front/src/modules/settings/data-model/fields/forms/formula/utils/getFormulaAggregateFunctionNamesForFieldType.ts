import {
  FieldMetadataType,
  type FormulaAggregateFunctionName,
} from 'twenty-shared/types';

export const getFormulaAggregateFunctionNamesForFieldType = (
  fieldType: FieldMetadataType,
): FormulaAggregateFunctionName[] => {
  if (fieldType === FieldMetadataType.NUMBER) {
    return ['count', 'sum', 'avg', 'min', 'max'];
  }

  if (
    fieldType === FieldMetadataType.DATE ||
    fieldType === FieldMetadataType.DATE_TIME
  ) {
    return ['min', 'max'];
  }

  return [];
};
