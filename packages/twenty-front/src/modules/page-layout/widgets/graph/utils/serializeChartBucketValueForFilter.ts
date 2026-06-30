import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';

type SerializeChartBucketValueForFilterParams = {
  fieldType: FieldMetadataType;
  bucketRawValue: unknown;
  operand: ViewFilterOperand;
  subFieldName?: string | null;
};

export const serializeChartBucketValueForFilter = ({
  fieldType,
  bucketRawValue,
  operand,
  subFieldName,
}: SerializeChartBucketValueForFilterParams): string => {
  const stringValue = String(bucketRawValue);

  const isCurrencyCodeSubField =
    fieldType === FieldMetadataType.CURRENCY && subFieldName === 'currencyCode';

  const isAddressCountrySubField =
    fieldType === FieldMetadataType.ADDRESS &&
    subFieldName === 'addressCountry';

  const needsJsonArrayWithIsOperand =
    operand === ViewFilterOperand.IS &&
    ([
      FieldMetadataType.SELECT,
      FieldMetadataType.UUID,
      FieldMetadataType.RELATION,
    ].includes(fieldType) ||
      isCurrencyCodeSubField);

  const needsJsonArrayWithContainsOperand =
    operand === ViewFilterOperand.CONTAINS &&
    (fieldType === FieldMetadataType.MULTI_SELECT || isAddressCountrySubField);

  const needsJsonArray =
    needsJsonArrayWithIsOperand || needsJsonArrayWithContainsOperand;

  return needsJsonArray ? JSON.stringify([stringValue]) : stringValue;
};
