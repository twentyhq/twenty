import { buildFiltersFromDateRange } from '@/page-layout/widgets/graph/utils/buildFiltersFromDateRange';
import { calculateQuarterDateRange } from '@/page-layout/widgets/graph/utils/calculateQuarterDateRange';
import { TZDate } from '@date-fns/tz';
import {
  ObjectRecordGroupByDateGranularity,
  type ViewFilterOperand,
} from 'twenty-shared/types';
import {
  getEndUnitOfDateTime,
  getStartUnitOfDateTime,
} from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export type RangeChartFilter = {
  fieldName: string;
  operand: ViewFilterOperand;
  value: string;
};

export const buildDateRangeFiltersForGranularity = (
  parsedBucketDate: Date,
  dateGranularity: ObjectRecordGroupByDateGranularity,
  fieldType: FieldMetadataType,
  fieldName: string,
  timezone?: string,
): RangeChartFilter[] => {
  const dateInTimezone =
    fieldType === FieldMetadataType.DATE_TIME && timezone
      ? new TZDate(parsedBucketDate, timezone)
      : parsedBucketDate;

  if (dateGranularity === ObjectRecordGroupByDateGranularity.WEEK) {
    return buildFiltersFromDateRange(
      getStartUnitOfDateTime(dateInTimezone, 'WEEK'),
      getEndUnitOfDateTime(dateInTimezone, 'WEEK'),
      fieldType,
      fieldName,
    );
  }

  if (dateGranularity === ObjectRecordGroupByDateGranularity.MONTH) {
    return buildFiltersFromDateRange(
      getStartUnitOfDateTime(dateInTimezone, 'MONTH'),
      getEndUnitOfDateTime(dateInTimezone, 'MONTH'),
      fieldType,
      fieldName,
    );
  }

  if (dateGranularity === ObjectRecordGroupByDateGranularity.QUARTER) {
    const quarterRange = calculateQuarterDateRange(dateInTimezone, timezone);

    return buildFiltersFromDateRange(
      quarterRange.rangeStartDate,
      quarterRange.rangeEndDate,
      fieldType,
      fieldName,
    );
  }

  return buildFiltersFromDateRange(
    getStartUnitOfDateTime(dateInTimezone, 'YEAR'),
    getEndUnitOfDateTime(dateInTimezone, 'YEAR'),
    fieldType,
    fieldName,
  );
};
