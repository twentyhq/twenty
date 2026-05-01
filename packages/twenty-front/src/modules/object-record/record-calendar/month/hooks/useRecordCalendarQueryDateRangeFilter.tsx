import { useRecordCalendarContextOrThrow } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { useRecordCalendarMonthDaysRange } from '@/object-record/record-calendar/month/hooks/useRecordCalendarMonthDaysRange';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { t } from '@lingui/core/macro';
import { type Temporal } from 'temporal-polyfill';
import { FieldMetadataType } from 'twenty-shared/types';
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
  const { objectMetadataItem, viewBarInstanceId } =
    useRecordCalendarContextOrThrow();
  const { firstDayOfFirstWeek, lastDayOfLastWeek } =
    useRecordCalendarMonthDaysRange(selectedDate);

  const { userTimezone } = useUserTimezone();

  const { currentView } = useGetCurrentViewOnly();

  const currentRecordFilterGroups = useAtomComponentStateValue(
    currentRecordFilterGroupsComponentState,
    viewBarInstanceId,
  );

  const currentRecordFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
    viewBarInstanceId,
  );

  const { filterValueDependencies } = useFilterValueDependencies();

  const anyFieldFilterValue = useAtomComponentStateValue(
    anyFieldFilterValueComponentState,
    viewBarInstanceId,
  );

  if (
    !isDefined(currentView) ||
    !isDefined(currentView.calendarFieldMetadataId)
  ) {
    return {
      dateRangeFilter: {},
    };
  }

  const dateRangeFilterFieldMetadataId = currentView.calendarFieldMetadataId;

  const calendarFieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.id === dateRangeFilterFieldMetadataId,
  );

  const isDateField =
    calendarFieldMetadataItem?.type === FieldMetadataType.DATE;

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

  const dateRangeFilterAfter: RecordFilter = {
    id: DATE_RANGE_FILTER_AFTER_ID,
    fieldMetadataId: dateRangeFilterFieldMetadataId,
    value: isDateField
      ? firstDayOfFirstWeek.toString()
      : firstDayOfFirstWeekISOString,
    operand: RecordFilterOperand.IS_AFTER,
    type: isDateField ? FieldMetadataType.DATE : FieldMetadataType.DATE_TIME,
    label: t`After or equal`,
    displayValue: `${firstDayOfFirstWeek.toString()}`,
  };

  const dateRangeFilterBefore: RecordFilter = {
    id: DATE_RANGE_FILTER_BEFORE_ID,
    fieldMetadataId: dateRangeFilterFieldMetadataId,
    value: isDateField
      ? lastDayOfLastWeek.add({ days: 1 }).toString()
      : nextDayAfterLastDayOfLastWeekISOString,
    operand: RecordFilterOperand.IS_BEFORE,
    type: isDateField ? FieldMetadataType.DATE : FieldMetadataType.DATE_TIME,
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
