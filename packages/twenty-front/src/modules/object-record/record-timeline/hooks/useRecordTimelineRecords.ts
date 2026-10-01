import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useRelevantRecordsGqlFields } from '@/object-record/record-field/hooks/useRelevantRecordsGqlFields';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { buildRecordTimelineDateRangeFilter } from '@/object-record/record-timeline/utils/buildRecordTimelineDateRangeFilter';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type Temporal } from 'temporal-polyfill';
import {
  combineFilters,
  computeRecordGqlOperationFilter,
  turnAnyFieldFilterIntoRecordGqlFilter,
} from 'twenty-shared/utils';

export const useRecordTimelineRecords = ({
  startFieldMetadataItem,
  endFieldMetadataItem,
  windowFirstDay,
  windowLastDay,
}: {
  startFieldMetadataItem: FieldMetadataItem;
  endFieldMetadataItem: FieldMetadataItem | undefined;
  windowFirstDay: Temporal.PlainDate;
  windowLastDay: Temporal.PlainDate;
}) => {
  const { objectMetadataItem, objectNameSingular, viewBarInstanceId } =
    useRecordIndexContextOrThrow();

  const { userTimezone } = useUserTimezone();

  const currentRecordFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
    viewBarInstanceId,
  );
  const currentRecordFilterGroups = useAtomComponentStateValue(
    currentRecordFilterGroupsComponentState,
    viewBarInstanceId,
  );
  const anyFieldFilterValue = useAtomComponentStateValue(
    anyFieldFilterValueComponentState,
    viewBarInstanceId,
  );
  const { filterValueDependencies } = useFilterValueDependencies();
  const flattenedFieldMetadataItems = useAtomStateValue(
    flattenedFieldMetadataItemsSelector,
  );

  const recordGqlFields = useRelevantRecordsGqlFields({
    objectMetadataItem,
    additionalFieldMetadataIds: [
      startFieldMetadataItem.id,
      endFieldMetadataItem?.id,
    ],
  });

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

  const dateRangeFilter = buildRecordTimelineDateRangeFilter({
    startFieldMetadataItem,
    endFieldMetadataItem,
    windowFirstDay,
    windowLastDay,
    timeZone: userTimezone,
  });

  return useFindManyRecords({
    objectNameSingular,
    filter: combineFilters([dateRangeFilter, viewFilter, anyFieldFilter]),
    orderBy: [{ [startFieldMetadataItem.name]: 'AscNullsLast' }],
    recordGqlFields,
  });
};
