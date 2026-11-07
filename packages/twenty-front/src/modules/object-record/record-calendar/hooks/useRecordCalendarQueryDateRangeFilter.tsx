import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { useRecordCalendarContextOrThrow } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { useRecordCalendarDaysRange } from '@/object-record/record-calendar/hooks/useRecordCalendarDaysRange';
import { useRecordIndexAdditionalFilter } from '@/object-record/record-index/hooks/useRecordIndexAdditionalFilter';
import { useRecordIndexQueryRecordFilters } from '@/object-record/record-index/hooks/useRecordIndexQueryRecordFilters';
import { recordIndexCalendarFieldMetadataIdComponentState } from '@/object-record/record-index/states/recordIndexCalendarFieldMetadataIdComponentState';
import { recordIndexCalendarLayoutComponentState } from '@/object-record/record-index/states/recordIndexCalendarLayoutComponentState';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type Temporal } from 'temporal-polyfill';
import {
  combineFilters,
  computeRecordGqlOperationFilter,
  isDefined,
  turnAnyFieldFilterIntoRecordGqlFilter,
  turnPlainDateIntoUserTimeZoneInstantString,
} from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const useRecordCalendarQueryDateRangeFilter = (
  selectedDate: Temporal.PlainDate,
) => {
  const { objectMetadataItem, viewBarInstanceId } =
    useRecordCalendarContextOrThrow();
  const recordIndexCalendarLayout = useAtomComponentStateValue(
    recordIndexCalendarLayoutComponentState,
  );
  const { firstDay, lastDay } = useRecordCalendarDaysRange(
    selectedDate,
    recordIndexCalendarLayout,
  );
  const { userTimezone } = useUserTimezone();
  const additionalFilter = useRecordIndexAdditionalFilter();
  const {
    recordFilters: currentRecordFilters,
    recordFilterGroups: currentRecordFilterGroups,
  } = useRecordIndexQueryRecordFilters(viewBarInstanceId);
  const { filterValueDependencies } = useFilterValueDependencies();
  const flattenedFieldMetadataItems = useAtomStateValue(
    flattenedFieldMetadataItemsSelector,
  );
  // Widget drafts only exist in the calendar instance until the dashboard is saved.
  const recordIndexCalendarFieldMetadataId = useAtomComponentStateValue(
    recordIndexCalendarFieldMetadataIdComponentState,
  );
  const anyFieldFilterValue = useAtomComponentStateValue(
    anyFieldFilterValueComponentState,
    viewBarInstanceId,
  );
  const calendarFieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.id === recordIndexCalendarFieldMetadataId,
  );

  if (!isDefined(calendarFieldMetadataItem)) {
    return { dateRangeFilter: {} };
  }

  const nextDay = lastDay.add({ days: 1 });
  const isDateTimeField =
    calendarFieldMetadataItem.type === FieldMetadataType.DATE_TIME;
  const dateRangeFilterAfter = {
    [calendarFieldMetadataItem.name]: {
      gte: isDateTimeField
        ? turnPlainDateIntoUserTimeZoneInstantString(firstDay, userTimezone)
        : firstDay.toString(),
    },
  };
  const dateRangeFilterBefore = {
    [calendarFieldMetadataItem.name]: {
      lt: isDateTimeField
        ? turnPlainDateIntoUserTimeZoneInstantString(nextDay, userTimezone)
        : nextDay.toString(),
    },
  };
  const viewFilter = computeRecordGqlOperationFilter({
    filterValueDependencies,
    recordFilters: currentRecordFilters,
    recordFilterGroups: currentRecordFilterGroups,
    fieldMetadataItems: flattenedFieldMetadataItems,
  });
  const { recordGqlOperationFilter: anyFieldFilter } =
    turnAnyFieldFilterIntoRecordGqlFilter({
      fields: objectMetadataItem.readableFields,
      filterValue: anyFieldFilterValue,
    });

  return {
    dateRangeFilter: combineFilters([
      dateRangeFilterAfter,
      dateRangeFilterBefore,
      viewFilter,
      anyFieldFilter,
      additionalFilter,
    ]),
  };
};
