import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { buildDateFilterForDayGranularity } from '@/page-layout/widgets/graph/utils/buildDateFilterForDayGranularity';
import { buildDateRangeFiltersForGranularity } from '@/page-layout/widgets/graph/utils/buildDateRangeFiltersForGranularity';
import { isCyclicalDateGranularity } from '@/page-layout/widgets/graph/utils/isCyclicalDateGranularity';
import { isTimeRangeDateGranularity } from '@/page-layout/widgets/graph/utils/isTimeRangeDateGranularity';
import { isNonEmptyString } from '@sniptt/guards';
import {
  ObjectRecordGroupByDateGranularity,
  ViewFilterOperand,
} from 'twenty-shared/types';
import {
  getFilterTypeFromFieldType,
  isDefined,
  isFieldMetadataDateKind,
} from 'twenty-shared/utils';
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

const formatChartFilterValue = (
  fieldType: FieldMetadataType,
  bucketRawValue: unknown,
  operand: ViewFilterOperand,
  subFieldName?: string | null,
): string => {
  const stringValue = String(bucketRawValue);

  const isCurrencyCodeSubField =
    fieldType === FieldMetadataType.CURRENCY && subFieldName === 'currencyCode';

  const needsJsonArray =
    operand === ViewFilterOperand.IS &&
    ([
      FieldMetadataType.SELECT,
      FieldMetadataType.UUID,
      FieldMetadataType.RELATION,
    ].includes(fieldType) ||
      isCurrencyCodeSubField);

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
    isFieldRelation(fieldMetadataItem) ||
    isFieldMorphRelation(fieldMetadataItem)
  ) {
    return [];
  }

  if (isFieldMetadataDateKind(fieldMetadataItem.type)) {
    const parsedBucketDate = new Date(String(bucketRawValue));

    if (isNaN(parsedBucketDate.getTime())) {
      return [];
    }

    if (isCyclicalDateGranularity(dateGranularity)) {
      return [];
    }

    if (
      !isDefined(dateGranularity) ||
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

  const availableOperands = getRecordFilterOperands({
    filterType: getFilterTypeFromFieldType(fieldMetadataItem.type),
    subFieldName: subFieldName ?? undefined,
  });

  if (availableOperands.length === 0) {
    return [];
  }

  const operand = availableOperands[0];

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
