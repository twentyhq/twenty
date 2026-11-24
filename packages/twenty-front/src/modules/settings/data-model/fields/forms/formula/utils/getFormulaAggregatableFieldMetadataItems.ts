import {
  FieldMetadataType,
  type FormulaAggregateFunctionName,
} from 'twenty-shared/types';
import { isQueryTimeFormulaFieldMetadata } from 'twenty-shared/utils';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

const NUMBER_FIELD_METADATA_TYPES: FieldMetadataType[] = [
  FieldMetadataType.NUMBER,
  FieldMetadataType.CURRENCY,
];

const DATE_FIELD_METADATA_TYPES: FieldMetadataType[] = [
  FieldMetadataType.DATE,
  FieldMetadataType.DATE_TIME,
];

const getAggregatableFieldMetadataTypes = ({
  functionName,
  fieldType,
}: {
  functionName: FormulaAggregateFunctionName;
  fieldType: FieldMetadataType;
}): FieldMetadataType[] => {
  if (functionName === 'count') {
    return [];
  }

  if (functionName === 'sum' || functionName === 'avg') {
    return fieldType === FieldMetadataType.NUMBER
      ? NUMBER_FIELD_METADATA_TYPES
      : [];
  }

  if (fieldType === FieldMetadataType.NUMBER) {
    return NUMBER_FIELD_METADATA_TYPES;
  }

  return DATE_FIELD_METADATA_TYPES.includes(fieldType)
    ? DATE_FIELD_METADATA_TYPES
    : [];
};

export const getFormulaAggregatableFieldMetadataItems = <
  TFieldMetadataItem extends Pick<
    FieldMetadataItem,
    'isActive' | 'isSystem' | 'type' | 'settings'
  >,
>({
  fieldMetadataItems,
  functionName,
  fieldType,
}: {
  fieldMetadataItems: TFieldMetadataItem[];
  functionName: FormulaAggregateFunctionName;
  fieldType: FieldMetadataType;
}): TFieldMetadataItem[] => {
  const aggregatableFieldMetadataTypes = getAggregatableFieldMetadataTypes({
    functionName,
    fieldType,
  });

  return fieldMetadataItems.filter(
    (fieldMetadataItem) =>
      fieldMetadataItem.isActive === true &&
      fieldMetadataItem.isSystem !== true &&
      !isQueryTimeFormulaFieldMetadata(fieldMetadataItem) &&
      aggregatableFieldMetadataTypes.includes(fieldMetadataItem.type),
  );
};
