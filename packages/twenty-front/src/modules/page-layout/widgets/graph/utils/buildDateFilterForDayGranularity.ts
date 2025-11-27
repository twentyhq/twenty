import { TZDate } from '@date-fns/tz';
import { ViewFilterOperand } from 'twenty-shared/types';
import {
  getEndUnitOfDateTime,
  getPlainDateFromDate,
  getStartUnitOfDateTime,
} from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type ChartFilter = {
  fieldName: string;
  operand: ViewFilterOperand;
  value: string;
};

export const buildDateFilterForDayGranularity = (
  parsedBucketDate: Date,
  fieldType: FieldMetadataType,
  fieldName: string,
  timezone?: string,
): ChartFilter[] => {
  if (fieldType === FieldMetadataType.DATE) {
    return [
      {
        fieldName,
        operand: ViewFilterOperand.IS,
        value: getPlainDateFromDate(parsedBucketDate),
      },
    ];
  }

  if (fieldType === FieldMetadataType.DATE_TIME) {
    const dateInTimezone = timezone
      ? new TZDate(parsedBucketDate, timezone)
      : parsedBucketDate;

    const startOfDayDate = getStartUnitOfDateTime(dateInTimezone, 'DAY');
    const endOfDayDate = getEndUnitOfDateTime(dateInTimezone, 'DAY');

    return [
      {
        fieldName,
        operand: ViewFilterOperand.IS_AFTER,
        value: startOfDayDate.toISOString(),
      },
      {
        fieldName,
        operand: ViewFilterOperand.IS_BEFORE,
        value: endOfDayDate.toISOString(),
      },
    ];
  }

  return [];
};
