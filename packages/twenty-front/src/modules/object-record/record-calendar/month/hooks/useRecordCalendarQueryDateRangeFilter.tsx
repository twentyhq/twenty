import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { useRecordCalendarContextOrThrow } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { useRecordCalendarMonthDaysRange } from '@/object-record/record-calendar/month/hooks/useRecordCalendarMonthDaysRange';
import { getRecordCalendarDateRangeOverlapFilter } from '@/object-record/record-calendar/month/utils/getRecordCalendarDateRangeOverlapFilter';
import { getSupportedRecordCalendarLayout } from '@/object-record/record-calendar/utils/getSupportedRecordCalendarLayout';
import { recordIndexCalendarEndFieldMetadataIdComponentState } from '@/object-record/record-index/states/recordIndexCalendarEndFieldMetadataIdComponentState';
import { recordIndexCalendarFieldMetadataIdComponentState } from '@/object-record/record-index/states/recordIndexCalendarFieldMetadataIdComponentState';
import { recordIndexCalendarLayoutComponentState } from '@/object-record/record-index/states/recordIndexCalendarLayoutComponentState';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { t } from '@lingui/core/macro';
import { type Temporal } from 'temporal-polyfill';
import {
  combineFilters,
  computeRecordGqlOperationFilter,
  isDefined,
  turnAnyFieldFilterIntoRecordGqlFilter,
  turnPlainDateIntoUserTimeZoneInstantString,
} from 'twenty-shared/utils';
import {
  FeatureFlagKey,
  FieldMetadataType,
  ViewCalendarLayout,
} from '~/generated-metadata/graphql';

const DATE_RANGE_FILTER_AFTER_ID = 'DATE_RANGE_FILTER_AFTER_ID';
const DATE_RANGE_FILTER_BEFORE_ID = 'DATE_RANGE_FILTER_BEFORE_ID';

export const useRecordCalendarQueryDateRangeFilter = (
  selectedDate: Temporal.PlainDate,
) => {
  const { objectMetadataItem, viewBarInstanceId } =
    useRecordCalendarContextOrThrow();
  const { firstDayOfFirstWeek, lastDayOfLastWeek } =
    useRecordCalendarMonthDaysRange(selectedDate);

  const recordIndexCalendarLayout = useAtomComponentStateValue(
    recordIndexCalendarLayoutComponentState,
  );
  const isCalendarWeekViewEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CALENDAR_WEEK_VIEW_ENABLED,
  );
  const supportedCalendarLayout = getSupportedRecordCalendarLayout({
    calendarLayout: recordIndexCalendarLayout,
    isCalendarWeekViewEnabled,
  });

  const firstDayOfSelectedMonth = selectedDate.with({ day: 1 });
  const firstDayOfRange =
    supportedCalendarLayout === ViewCalendarLayout.TIMELINE
      ? firstDayOfSelectedMonth
      : firstDayOfFirstWeek;
  const nextDayAfterLastDayOfRange =
    supportedCalendarLayout === ViewCalendarLayout.TIMELINE
      ? firstDayOfSelectedMonth.add({ months: 4 })
      : lastDayOfLastWeek.add({ days: 1 });
  const lastDayOfRange = nextDayAfterLastDayOfRange.subtract({ days: 1 });

  const { userTimezone } = useUserTimezone();

  const currentRecordFilterGroups = useAtomComponentStateValue(
    currentRecordFilterGroupsComponentState,
    viewBarInstanceId,
  );

  const currentRecordFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
    viewBarInstanceId,
  );

  const { filterValueDependencies } = useFilterValueDependencies();

  const flattenedFieldMetadataItems = useAtomStateValue(
    flattenedFieldMetadataItemsSelector,
  );
  // Read per calendar instance (hydrated from the draft view in widget
  // edit mode, from the persisted view elsewhere) instead of the current
  // view store: a widget's pending view only exists after dashboard save.
  const recordIndexCalendarFieldMetadataId = useAtomComponentStateValue(
    recordIndexCalendarFieldMetadataIdComponentState,
  );
  const recordIndexCalendarEndFieldMetadataId = useAtomComponentStateValue(
    recordIndexCalendarEndFieldMetadataIdComponentState,
  );

  const anyFieldFilterValue = useAtomComponentStateValue(
    anyFieldFilterValueComponentState,
    viewBarInstanceId,
  );

  if (!isDefined(recordIndexCalendarFieldMetadataId)) {
    return {
      dateRangeFilter: {},
    };
  }

  const firstDayOfRangeISOString = turnPlainDateIntoUserTimeZoneInstantString(
    firstDayOfRange,
    userTimezone,
  );

  const nextDayAfterLastDayOfRangeISOString =
    turnPlainDateIntoUserTimeZoneInstantString(
      nextDayAfterLastDayOfRange,
      userTimezone,
    );

  const dateRangeFilterFieldMetadataId = recordIndexCalendarFieldMetadataId;

  const calendarFieldMetadataItem = objectMetadataItem.fields.find(
    (fieldMetadataItem) =>
      fieldMetadataItem.id === recordIndexCalendarFieldMetadataId,
  );

  const calendarEndFieldMetadataItem = objectMetadataItem.fields.find(
    (fieldMetadataItem) =>
      fieldMetadataItem.id === recordIndexCalendarEndFieldMetadataId,
  );

  const dateRangeOverlapFilter = isDefined(calendarFieldMetadataItem)
    ? getRecordCalendarDateRangeOverlapFilter({
        calendarField: calendarFieldMetadataItem,
        calendarEndField: calendarEndFieldMetadataItem,
        firstDayOfRange:
          calendarFieldMetadataItem.type === FieldMetadataType.DATE_TIME
            ? firstDayOfRangeISOString
            : firstDayOfRange.toString(),
        nextDayAfterLastDayOfRange:
          calendarFieldMetadataItem.type === FieldMetadataType.DATE_TIME
            ? nextDayAfterLastDayOfRangeISOString
            : nextDayAfterLastDayOfRange.toString(),
      })
    : undefined;

  const dateRangeFilterAfter: RecordFilter = {
    id: DATE_RANGE_FILTER_AFTER_ID,
    fieldMetadataId: dateRangeFilterFieldMetadataId,
    value: `${firstDayOfRangeISOString}`,
    operand: RecordFilterOperand.IS_AFTER,
    type: 'DATE_TIME',
    label: t`After or equal`,
    displayValue: `${firstDayOfRange.toString()}`,
  };

  const dateRangeFilterBefore: RecordFilter = {
    id: DATE_RANGE_FILTER_BEFORE_ID,
    fieldMetadataId: dateRangeFilterFieldMetadataId,
    value: `${nextDayAfterLastDayOfRangeISOString}`,
    operand: RecordFilterOperand.IS_BEFORE,
    type: 'DATE_TIME',
    label: t`Before`,
    displayValue: `${lastDayOfRange.toString()}`,
  };

  const calendarRecordFilters = isDefined(dateRangeOverlapFilter)
    ? currentRecordFilters
    : [...currentRecordFilters, dateRangeFilterAfter, dateRangeFilterBefore];

  const dateRangeFilter = computeRecordGqlOperationFilter({
    filterValueDependencies,
    recordFilters: calendarRecordFilters,
    recordFilterGroups: currentRecordFilterGroups,
    fieldMetadataItems: flattenedFieldMetadataItems,
  });

  const { recordGqlOperationFilter: anyFieldFilter } =
    turnAnyFieldFilterIntoRecordGqlFilter({
      fields: objectMetadataItem.fields,
      filterValue: anyFieldFilterValue,
    });

  const combinedFilter = combineFilters([
    dateRangeFilter,
    dateRangeOverlapFilter ?? {},
    anyFieldFilter,
  ]);

  return {
    dateRangeFilter: combinedFilter,
  };
};
