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
  dateGranularity?: ObjectRecordGroupByDateGranularity | null; // Will be used for date filtering
  subFieldName?: string | null;
  timezone?: string; // Will be used for date filtering
};

const selectChartFilterOperand = (
  fieldType: FilterableAndTSVectorFieldType,
): ViewFilterOperand => {
  const fieldsUsingContainsOperand: FilterableAndTSVectorFieldType[] = [
    'TEXT',
    'FULL_NAME',
    'EMAILS',
    'PHONES',
    'LINKS',
    'RAW_JSON',
  ];

  const fieldsUsingIsOperand: FilterableAndTSVectorFieldType[] = [
    'SELECT',
    'BOOLEAN',
    'NUMBER',
    'RATING',
    'UUID',
    'RELATION',
  ];

  if (fieldsUsingContainsOperand.includes(fieldType)) {
    return ViewFilterOperand.CONTAINS;
  }

  if (fieldsUsingIsOperand.includes(fieldType)) {
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

  // TODO: Implement Date/Time filtering
  if (
    fieldMetadataItem.type === FieldMetadataType.DATE ||
    fieldMetadataItem.type === FieldMetadataType.DATE_TIME
  ) {
    return [];
  }

  // TODO: Implement complex types (Address, Currency, etc)
  const complexTypes = [
    FieldMetadataType.CURRENCY,
    FieldMetadataType.ADDRESS,
    FieldMetadataType.ACTOR,
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
