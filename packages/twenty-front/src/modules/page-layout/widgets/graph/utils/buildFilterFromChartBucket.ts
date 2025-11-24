import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isNonEmptyString } from '@sniptt/guards';
import {
  ViewFilterOperand,
  type FilterableAndTSVectorFieldType,
  type ObjectRecordGroupByDateGranularity,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type ChartFilter = {
  fieldName: string;
  operand: ViewFilterOperand;
  value: string;
};

type BuildFilterFromChartBucketParams = {
  fieldMetadataItem: FieldMetadataItem;
  bucketRawValue: unknown;
  dateGranularity?: ObjectRecordGroupByDateGranularity | null;
  subFieldName?: string | null;
  timezone?: string;
};

const selectChartFilterOperand = (
  fieldType: FilterableAndTSVectorFieldType,
): ViewFilterOperand => {
  const textLikeFields: FilterableAndTSVectorFieldType[] = ['TEXT'];

  const isOperandFields: FilterableAndTSVectorFieldType[] = [
    'SELECT',
    'BOOLEAN',
    'NUMBER',
    'RATING',
    'UUID',
    'RELATION',
  ];

  if (textLikeFields.includes(fieldType)) {
    return ViewFilterOperand.CONTAINS;
  }

  if (isOperandFields.includes(fieldType)) {
    return ViewFilterOperand.IS;
  }

  return ViewFilterOperand.IS;
};

const formatChartFilterValue = (
  fieldType: FieldMetadataType,
  bucketRawValue: unknown,
  operand: ViewFilterOperand,
): string => {
  const stringValue = String(bucketRawValue);

  const needsJsonArray =
    operand === ViewFilterOperand.IS &&
    [
      FieldMetadataType.SELECT,
      FieldMetadataType.UUID,
      FieldMetadataType.RELATION,
    ].includes(fieldType);

  return needsJsonArray ? JSON.stringify([stringValue]) : stringValue;
};

export const buildFilterFromChartBucket = ({
  fieldMetadataItem,
  bucketRawValue,
  subFieldName,
}: BuildFilterFromChartBucketParams): ChartFilter[] => {
  const fieldName = isNonEmptyString(subFieldName)
    ? `${fieldMetadataItem.name}.${subFieldName}`
    : fieldMetadataItem.name;

  if (!isDefined(bucketRawValue) || !isNonEmptyString(String(bucketRawValue))) {
    return [
      {
        fieldName,
        operand: ViewFilterOperand.IS_EMPTY,
        value: '',
      },
    ];
  }

  // TODO: Implement Date/Time filtering in PR 3
  if (
    fieldMetadataItem.type === FieldMetadataType.DATE ||
    fieldMetadataItem.type === FieldMetadataType.DATE_TIME
  ) {
    return [];
  }

  // TODO: Implement complex types (Address, Currency, etc) in PR 4
  const complexTypes = [
    FieldMetadataType.CURRENCY,
    FieldMetadataType.ADDRESS,
    FieldMetadataType.ACTOR,
    FieldMetadataType.FULL_NAME,
    FieldMetadataType.EMAILS,
    FieldMetadataType.PHONES,
    FieldMetadataType.LINKS,
    FieldMetadataType.RAW_JSON,
    FieldMetadataType.MULTI_SELECT,
    FieldMetadataType.ARRAY,
  ];

  if (complexTypes.includes(fieldMetadataItem.type)) {
    return [];
  }

  const nonFilterableTypes = [
    FieldMetadataType.POSITION,
    FieldMetadataType.MORPH_RELATION,
    FieldMetadataType.TS_VECTOR,
    FieldMetadataType.RICH_TEXT,
    FieldMetadataType.RICH_TEXT_V2,
  ];

  if (nonFilterableTypes.includes(fieldMetadataItem.type)) {
    return [];
  }

  const operand = selectChartFilterOperand(
    fieldMetadataItem.type as FilterableAndTSVectorFieldType,
  );

  const value = formatChartFilterValue(
    fieldMetadataItem.type,
    bucketRawValue,
    operand,
  );

  return [
    {
      fieldName,
      operand,
      value,
    },
  ];
};
