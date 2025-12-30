import { useRecordCalendarContextOrThrow } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { useRecordCalendarMonthDaysRange } from '@/object-record/record-calendar/month/hooks/useRecordCalendarMonthDaysRange';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { t } from '@lingui/core/macro';
import { type Temporal } from 'temporal-polyfill';
import {
  combineFilters,
  computeRecordGqlOperationFilter,
  isDefined,
  turnAnyFieldFilterIntoRecordGqlFilter,
  turnPlainDateIntoUserTimeZoneInstantString,
} from 'twenty-shared/utils';

const DATE_RANGE_FILTER_AFTER_ID = 'DATE_RANGE_FILTER_AFTER_ID';
const DATE_RANGE_FILTER_BEFORE_ID = 'DATE_RANGE_FILTER_BEFORE_ID';

export const useRecordCalendarQueryDateRangeFilter = (
  selectedDate: Temporal.PlainDate,
) => {
  const { objectMetadataItem } = useRecordCalendarContextOrThrow();
  const { firstDayOfFirstWeek, lastDayOfLastWeek } =
    useRecordCalendarMonthDaysRange(selectedDate);

  const { userTimezone } = useUserTimezone();

  const { currentView } = useGetCurrentViewOnly();

  const currentRecordFilterGroups = useRecoilComponentValue(
    currentRecordFilterGroupsComponentState,
  );

  const currentRecordFilters = useRecoilComponentValue(
    currentRecordFiltersComponentState,
  );

  const { filterValueDependencies } = useFilterValueDependencies();

  const anyFieldFilterValue = useRecoilComponentValue(
    anyFieldFilterValueComponentState,
  );

  if (
    !isDefined(currentView) ||
    !isDefined(currentView.calendarFieldMetadataId)
  ) {
    return {
      dateRangeFilter: {},
    };
  }

  const firstDayOfFirstWeekISOString =
    turnPlainDateIntoUserTimeZoneInstantString(
      firstDayOfFirstWeek,
      userTimezone,
    );

  const nextDayAfterLastDayOfLastWeekISOString =
    turnPlainDateIntoUserTimeZoneInstantString(
      lastDayOfLastWeek.add({ days: 1 }),
      userTimezone,
    );

  const dateRangeFilterFieldMetadataId = currentView.calendarFieldMetadataId;

  const dateRangeFilterAfter: RecordFilter = {
    id: DATE_RANGE_FILTER_AFTER_ID,
    fieldMetadataId: dateRangeFilterFieldMetadataId,
    value: `${firstDayOfFirstWeekISOString}`,
    operand: RecordFilterOperand.IS_AFTER,
    type: 'DATE_TIME',
    label: t`After or equal`,
    displayValue: `${firstDayOfFirstWeek.toString()}`,
  };

  const dateRangeFilterBefore: RecordFilter = {
    id: DATE_RANGE_FILTER_BEFORE_ID,
    fieldMetadataId: dateRangeFilterFieldMetadataId,
    value: `${nextDayAfterLastDayOfLastWeekISOString}`,
    operand: RecordFilterOperand.IS_BEFORE,
    type: 'DATE_TIME',
    label: t`Before`,
    displayValue: `${lastDayOfLastWeek.toString()}`,
  };

  const dateRangeFilter = computeRecordGqlOperationFilter({
    filterValueDependencies,
    recordFilters: [
      ...currentRecordFilters,
      dateRangeFilterAfter,
      dateRangeFilterBefore,
    ],
    recordFilterGroups: currentRecordFilterGroups,
    fields: objectMetadataItem.fields,
  });

  const { recordGqlOperationFilter: anyFieldFilter } =
    turnAnyFieldFilterIntoRecordGqlFilter({
      fields: objectMetadataItem.fields,
      filterValue: anyFieldFilterValue,
    });

  const combinedFilter = combineFilters([dateRangeFilter, anyFieldFilter]);

  return {
    dateRangeFilter: combinedFilter,
  };
};
