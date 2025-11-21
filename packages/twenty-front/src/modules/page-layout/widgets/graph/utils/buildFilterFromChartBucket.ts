import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { buildDateFilterForDayGranularity } from '@/page-layout/widgets/graph/utils/buildDateFilterForDayGranularity';
import { buildDateRangeFiltersForGranularity } from '@/page-layout/widgets/graph/utils/buildDateRangeFiltersForGranularity';
import { isNonEmptyString } from '@sniptt/guards';
import {
  ObjectRecordGroupByDateGranularity,
  ViewFilterOperand,
  type FilterableAndTSVectorFieldType,
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

const isTimeRangeDateGranularity = (
  granularity?: ObjectRecordGroupByDateGranularity | null,
): boolean => {
  if (!granularity) return false;
  return [
    ObjectRecordGroupByDateGranularity.MONTH,
    ObjectRecordGroupByDateGranularity.QUARTER,
    ObjectRecordGroupByDateGranularity.YEAR,
  ].includes(granularity);
};

const selectChartFilterOperand = (
  fieldType: FilterableAndTSVectorFieldType,
  subFieldName?: string | null,
): ViewFilterOperand => {
  const textLikeFields: FilterableAndTSVectorFieldType[] = [
    'TEXT',
    'FULL_NAME',
    'EMAILS',
    'PHONES',
    'LINKS',
    'RAW_JSON',
  ];

  const containsJsonArrayFields: FilterableAndTSVectorFieldType[] = [
    'MULTI_SELECT',
    'ARRAY',
  ];

  const isOperandFields: FilterableAndTSVectorFieldType[] = [
    'SELECT',
    'BOOLEAN',
    'NUMBER',
    'RATING',
    'UUID',
    'RELATION',
  ];

  if (fieldType === 'CURRENCY') {
    if (subFieldName === 'currencyCode') {
      return ViewFilterOperand.IS;
    }
    return ViewFilterOperand.IS;
  }

  if (fieldType === 'ADDRESS') {
    if (subFieldName === 'addressCountry') {
      return ViewFilterOperand.IS;
    }
    return ViewFilterOperand.CONTAINS;
  }

  if (fieldType === 'ACTOR') {
    if (subFieldName === 'source') {
      return ViewFilterOperand.IS;
    }
    return ViewFilterOperand.CONTAINS;
  }

  if (textLikeFields.includes(fieldType)) {
    return ViewFilterOperand.CONTAINS;
  }

  if (containsJsonArrayFields.includes(fieldType)) {
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
  subFieldName?: string | null,
): string => {
  const stringValue = String(bucketRawValue);

  const needsJsonArray =
    (operand === ViewFilterOperand.IS &&
      [
        FieldMetadataType.SELECT,
        FieldMetadataType.UUID,
        FieldMetadataType.RELATION,
      ].includes(fieldType)) ||
    (operand === ViewFilterOperand.CONTAINS &&
      [FieldMetadataType.MULTI_SELECT, FieldMetadataType.ARRAY].includes(
        fieldType,
      )) ||
    (fieldType === FieldMetadataType.CURRENCY &&
      subFieldName === 'currencyCode') ||
    (fieldType === FieldMetadataType.ADDRESS &&
      subFieldName === 'addressCountry') ||
    (fieldType === FieldMetadataType.ACTOR && subFieldName === 'source');

  return needsJsonArray ? JSON.stringify([stringValue]) : stringValue;
};

export const buildFilterFromChartBucket = ({
  fieldMetadataItem,
  bucketRawValue,
  dateGranularity,
  subFieldName,
  timezone,
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

  if (
    fieldMetadataItem.type === FieldMetadataType.DATE ||
    fieldMetadataItem.type === FieldMetadataType.DATE_TIME
  ) {
    const parsedBucketDate = new Date(String(bucketRawValue));

    if (isNaN(parsedBucketDate.getTime())) {
      return [];
    }

    if (
      dateGranularity === ObjectRecordGroupByDateGranularity.DAY_OF_THE_WEEK ||
      dateGranularity ===
        ObjectRecordGroupByDateGranularity.MONTH_OF_THE_YEAR ||
      dateGranularity === ObjectRecordGroupByDateGranularity.QUARTER_OF_THE_YEAR
    ) {
      return [];
    }

    if (
      !dateGranularity ||
      dateGranularity === ObjectRecordGroupByDateGranularity.DAY ||
      dateGranularity === ObjectRecordGroupByDateGranularity.NONE
    ) {
      return buildDateFilterForDayGranularity(
        parsedBucketDate,
        fieldMetadataItem.type,
        fieldName,
        timezone,
      );
    }

    if (isTimeRangeDateGranularity(dateGranularity)) {
      return buildDateRangeFiltersForGranularity(
        parsedBucketDate,
        dateGranularity,
        fieldMetadataItem.type,
        fieldName,
        timezone,
      );
    }

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
    subFieldName,
  );

  const value = formatChartFilterValue(
    fieldMetadataItem.type,
    bucketRawValue,
    operand,
    subFieldName,
  );

  return [
    {
      fieldName,
      operand,
      value,
    },
  ];
};
