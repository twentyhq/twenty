import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { buildDateRangeFiltersForGranularity } from '@/page-layout/widgets/graph/utils/buildDateRangeFiltersForGranularity';
import { isCyclicalDateGranularity } from '@/page-layout/widgets/graph/utils/isCyclicalDateGranularity';
import { isTimeRangeDateGranularity } from '@/page-layout/widgets/graph/utils/isTimeRangeDateGranularity';
import { serializeChartBucketValueForFilter } from '@/page-layout/widgets/graph/utils/serializeChartBucketValueForFilter';
import { isNonEmptyString } from '@sniptt/guards';
import {
  type FirstDayOfTheWeek,
  ObjectRecordGroupByDateGranularity,
  ViewFilterOperand,
} from 'twenty-shared/types';
import {
  getFilterTypeFromFieldType,
  isDefined,
  isFieldMetadataDateKind,
  parseToPlainDateOrThrow,
} from 'twenty-shared/utils';

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
  firstDayOfTheWeek?: FirstDayOfTheWeek;
};

export const buildFilterFromChartBucket = ({
  fieldMetadataItem,
  bucketRawValue,
  dateGranularity,
  subFieldName,
  timezone,
  firstDayOfTheWeek,
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
    if (isCyclicalDateGranularity(dateGranularity)) {
      return [];
    }

    const shouldAssumeDayRangeFilter =
      !isDefined(dateGranularity) ||
      dateGranularity === ObjectRecordGroupByDateGranularity.DAY ||
      dateGranularity === ObjectRecordGroupByDateGranularity.NONE;

    if (shouldAssumeDayRangeFilter) {
      if (!isNonEmptyString(timezone)) {
        throw new Error(
          `Timezone should be defined for date granularity group by day`,
        );
      }

      if (!isDefined(firstDayOfTheWeek)) {
        throw new Error(
          `First day of the week should be defined for date granularity group by day`,
        );
      }

      const parsedZonedDateTime = parseToPlainDateOrThrow(
        String(bucketRawValue),
      ).toZonedDateTime(timezone);

      return buildDateRangeFiltersForGranularity(
        parsedZonedDateTime,
        ObjectRecordGroupByDateGranularity.DAY,
        fieldMetadataItem.type,
        fieldName,
        firstDayOfTheWeek,
      );
    }

    if (isTimeRangeDateGranularity(dateGranularity)) {
      if (!isNonEmptyString(timezone)) {
        throw new Error(
          `Timezone should be defined for date granularity group by`,
        );
      }

      if (!isDefined(firstDayOfTheWeek)) {
        throw new Error(
          `First day of the week should be defined for date granularity group by`,
        );
      }

      const parsedDateTime = parseToPlainDateOrThrow(
        String(bucketRawValue),
      ).toZonedDateTime(timezone);

      return buildDateRangeFiltersForGranularity(
        parsedDateTime,
        dateGranularity,
        fieldMetadataItem.type,
        fieldName,
        firstDayOfTheWeek,
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

  const value = serializeChartBucketValueForFilter({
    fieldType: fieldMetadataItem.type,
    bucketRawValue,
    operand,
    subFieldName,
  });

  return [
    {
      fieldName,
      operand,
      value,
    },
  ];
};
