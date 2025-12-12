import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';
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
  parseToPlainDateOrThrow,
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

      console.log({ bucketRawValue });

      const parsedDateTime1 = parseToPlainDateOrThrow(String(bucketRawValue));

      const parsedDateTime2 = parsedDateTime1.toZonedDateTime(timezone);

      console.log({ parsedDateTime1, parsedDateTime2 });

      return buildDateRangeFiltersForGranularity(
        parsedDateTime2,
        ObjectRecordGroupByDateGranularity.DAY,
        fieldMetadataItem.type,
        fieldName,
      );
    }

    if (isTimeRangeDateGranularity(dateGranularity)) {
      if (!isNonEmptyString(timezone)) {
        throw new Error(
          `Timezone should be defined for date granularity group by`,
        );
      }

      console.log({ bucketRawValue });

      const parsedDateTime = parseToPlainDateOrThrow(
        String(bucketRawValue),
      ).toZonedDateTime(timezone);

      return buildDateRangeFiltersForGranularity(
        parsedDateTime,
        dateGranularity,
        fieldMetadataItem.type,
        fieldName,
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
  );

  return [
    {
      fieldName,
      operand,
      value,
    },
  ];
};
