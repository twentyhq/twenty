import { type RangeChartFilter } from '@/page-layout/widgets/graph/utils/buildDateRangeFiltersForGranularity';
import { type Temporal } from 'temporal-polyfill';
import { ViewFilterOperand } from 'twenty-shared/types';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const buildFiltersFromDateRange = (
  rangeStartDate: Temporal.ZonedDateTime,
  rangeEndDate: Temporal.ZonedDateTime,
  fieldType: FieldMetadataType,
  fieldName: string,
): RangeChartFilter[] => {
  if (fieldType === FieldMetadataType.DATE_TIME) {
    return [
      {
        fieldName,
        operand: ViewFilterOperand.IS_AFTER,
        value: rangeStartDate.toString({ timeZoneName: 'never' }),
      },
      {
        fieldName,
        operand: ViewFilterOperand.IS_BEFORE,
        value: rangeEndDate.toString({ timeZoneName: 'never' }),
      },
    ];
  }

  return [
    {
      fieldName,
      operand: ViewFilterOperand.IS_AFTER,
      value: rangeStartDate.toPlainDate().toString(),
    },
    {
      fieldName,
      operand: ViewFilterOperand.IS_BEFORE,
      value: rangeEndDate.toPlainDate().toString(),
    },
  ];
};
