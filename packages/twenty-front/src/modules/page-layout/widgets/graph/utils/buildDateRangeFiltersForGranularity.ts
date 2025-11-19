import { TZDate } from '@date-fns/tz';
import {
  ObjectRecordGroupByDateGranularity,
  ViewFilterOperand,
} from 'twenty-shared/types';
import {
  getEndUnitOfDateTime,
  getPlainDateFromDate,
  getStartUnitOfDateTime,
} from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { calculateQuarterDateRange } from '@/page-layout/widgets/graph/utils/calculateQuarterDateRange';

type ChartFilter = {
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
): ChartFilter[] => {
  const dateInTimezone =
    fieldType === FieldMetadataType.DATE_TIME && timezone
      ? new TZDate(parsedBucketDate, timezone)
      : parsedBucketDate;

  let rangeStartDate: Date;
  let rangeEndDate: Date;

  if (dateGranularity === ObjectRecordGroupByDateGranularity.MONTH) {
    rangeStartDate = getStartUnitOfDateTime(dateInTimezone, 'MONTH');
    rangeEndDate = getEndUnitOfDateTime(dateInTimezone, 'MONTH');
  } else if (dateGranularity === ObjectRecordGroupByDateGranularity.QUARTER) {
    const quarterRange = calculateQuarterDateRange(dateInTimezone, timezone);
    rangeStartDate = quarterRange.rangeStartDate;
    rangeEndDate = quarterRange.rangeEndDate;
  } else {
    rangeStartDate = getStartUnitOfDateTime(dateInTimezone, 'YEAR');
    rangeEndDate = getEndUnitOfDateTime(dateInTimezone, 'YEAR');
  }

  if (fieldType === FieldMetadataType.DATE_TIME) {
    return [
      {
        fieldName,
        operand: ViewFilterOperand.IS_AFTER,
        value: rangeStartDate.toISOString(),
      },
      {
        fieldName,
        operand: ViewFilterOperand.IS_BEFORE,
        value: rangeEndDate.toISOString(),
      },
    ];
  }

  return [
    {
      fieldName,
      operand: ViewFilterOperand.IS_AFTER,
      value: getPlainDateFromDate(rangeStartDate),
    },
    {
      fieldName,
      operand: ViewFilterOperand.IS_BEFORE,
      value: getPlainDateFromDate(rangeEndDate),
    },
  ];
};
