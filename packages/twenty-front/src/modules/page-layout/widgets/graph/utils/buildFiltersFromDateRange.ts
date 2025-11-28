import { type RangeChartFilter } from '@/page-layout/widgets/graph/utils/buildDateRangeFiltersForGranularity';
import { ViewFilterOperand } from 'twenty-shared/types';
import { getPlainDateFromDate } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const buildFiltersFromDateRange = (
  rangeStartDate: Date,
  rangeEndDate: Date,
  fieldType: FieldMetadataType,
  fieldName: string,
): RangeChartFilter[] => {
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
