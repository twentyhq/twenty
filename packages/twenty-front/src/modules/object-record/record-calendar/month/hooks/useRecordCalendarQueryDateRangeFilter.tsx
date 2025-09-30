import { useRecordCalendarContextOrThrow } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { useRecordCalendarMonthDaysRange } from '@/object-record/record-calendar/month/hooks/useRecordCalendarMonthDaysRange';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import {
  computeRecordGqlOperationFilter,
  isDefined,
} from 'twenty-shared/utils';

const DATE_RANGE_FILTER_AFTER_ID = 'DATE_RANGE_FILTER_AFTER_ID';
const DATE_RANGE_FILTER_BEFORE_ID = 'DATE_RANGE_FILTER_BEFORE_ID';

export const useRecordCalendarQueryDateRangeFilter = (selectedDate: Date) => {
  const { objectMetadataItem } = useRecordCalendarContextOrThrow();
  const { firstDayOfFirstWeek, lastDayOfLastWeek } =
    useRecordCalendarMonthDaysRange(selectedDate);

  const { currentView } = useGetCurrentViewOnly();

  if (
    !isDefined(currentView) ||
    !isDefined(currentView.calendarFieldMetadataId)
  ) {
    return {
      dateRangeFilter: {},
    };
  }

  const dateRangeFilterFieldMetadataId = currentView.calendarFieldMetadataId;

  const dateRangeFilterAfter: RecordFilter = {
    id: DATE_RANGE_FILTER_AFTER_ID,
    fieldMetadataId: dateRangeFilterFieldMetadataId,
    value: `${firstDayOfFirstWeek.toISOString()}`,
    operand: RecordFilterOperand.IsAfter,
    type: 'DATE',
    label: 'After',
    displayValue: `${firstDayOfFirstWeek.toISOString()}`,
  };

  const dateRangeFilterBefore: RecordFilter = {
    id: DATE_RANGE_FILTER_BEFORE_ID,
    fieldMetadataId: dateRangeFilterFieldMetadataId,
    value: `${lastDayOfLastWeek.toISOString()}`,
    operand: RecordFilterOperand.IsBefore,
    type: 'DATE',
    label: 'Before',
    displayValue: `${lastDayOfLastWeek.toISOString()}`,
  };

  const dateRangeFilter = computeRecordGqlOperationFilter({
    filterValueDependencies: {},
    recordFilters: [dateRangeFilterAfter, dateRangeFilterBefore],
    recordFilterGroups: [],
    fields: objectMetadataItem.fields,
  });

  return {
    dateRangeFilter,
  };
};
