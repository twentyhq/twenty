import { buildDateFilterForDayGranularity } from '@/page-layout/widgets/graph/utils/buildDateFilterForDayGranularity';
import { buildFiltersFromDateRange } from '@/page-layout/widgets/graph/utils/buildFiltersFromDateRange';
import { type Temporal } from 'temporal-polyfill';
import {
  type FirstDayOfTheWeek,
  ObjectRecordGroupByDateGranularity,
  type ViewFilterOperand,
} from 'twenty-shared/types';
import { getNextPeriodStart, getPeriodStart } from 'twenty-shared/utils';
import { type FieldMetadataType } from '~/generated-metadata/graphql';

export type RangeChartFilter = {
  fieldName: string;
  operand: ViewFilterOperand;
  value: string;
};

export const buildDateRangeFiltersForGranularity = (
  referenceDayWithTimeZone: Temporal.ZonedDateTime,
  dateGranularity: ObjectRecordGroupByDateGranularity,
  fieldType: FieldMetadataType,
  fieldName: string,
  firstDayOfTheWeek?: FirstDayOfTheWeek,
): RangeChartFilter[] => {
  switch (dateGranularity) {
    case ObjectRecordGroupByDateGranularity.WEEK: {
      return buildFiltersFromDateRange(
        getPeriodStart(referenceDayWithTimeZone, 'WEEK', firstDayOfTheWeek),
        getNextPeriodStart(referenceDayWithTimeZone, 'WEEK', firstDayOfTheWeek),
        fieldType,
        fieldName,
      );
    }
    case ObjectRecordGroupByDateGranularity.MONTH: {
      return buildFiltersFromDateRange(
        getPeriodStart(referenceDayWithTimeZone, 'MONTH'),
        getNextPeriodStart(referenceDayWithTimeZone, 'MONTH'),
        fieldType,
        fieldName,
      );
    }
    case ObjectRecordGroupByDateGranularity.QUARTER: {
      return buildFiltersFromDateRange(
        getPeriodStart(referenceDayWithTimeZone, 'QUARTER'),
        getNextPeriodStart(referenceDayWithTimeZone, 'QUARTER'),
        fieldType,
        fieldName,
      );
    }
    case ObjectRecordGroupByDateGranularity.YEAR: {
      return buildFiltersFromDateRange(
        getPeriodStart(referenceDayWithTimeZone, 'YEAR'),
        getNextPeriodStart(referenceDayWithTimeZone, 'YEAR'),
        fieldType,
        fieldName,
      );
    }
    case ObjectRecordGroupByDateGranularity.DAY:
    default:
      return buildDateFilterForDayGranularity(
        referenceDayWithTimeZone,
        fieldType,
        fieldName,
      );
  }
};
