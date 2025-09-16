import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { turnSortsIntoOrderBy } from '@/object-record/object-sort-dropdown/utils/turnSortsIntoOrderBy';
import { useRecordCalendarContextOrThrow } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { useRecordCalendarQueryDateRangeFilter } from '@/object-record/record-calendar/month/hooks/useRecordCalendarQueryDateRangeFilter';
import { recordCalendarSelectedDateComponentState } from '@/object-record/record-calendar/states/recordCalendarSelectedDateComponentState';
import { useRecordFieldGqlFields } from '@/object-record/record-field/hooks/useRecordTableRecordGqlFields';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { combineFilters } from '@/object-record/record-filter/utils/combineFilters';
import { computeRecordGqlOperationFilter } from '@/object-record/record-filter/utils/computeRecordGqlOperationFilter';
import { turnAnyFieldFilterIntoRecordGqlFilter } from '@/object-record/record-filter/utils/turnAnyFieldFilterIntoRecordGqlFilter';
import { useFindManyRecordIndexTableParams } from '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useEffect } from 'react';

export const RecordIndexCalendarDataLoaderEffect = () => {
  const recordCalendarSelectedDate = useRecoilComponentValue(
    recordCalendarSelectedDateComponentState,
  );
  const { objectMetadataItem } = useRecordCalendarContextOrThrow();

  const { upsertRecords: upsertRecordsInStore } = useUpsertRecordsInStore();

  const currentRecordFilterGroups = useRecoilComponentValue(
    currentRecordFilterGroupsComponentState,
  );

  const currentRecordFilters = useRecoilComponentValue(
    currentRecordFiltersComponentState,
  );

  const currentRecordSorts = useRecoilComponentValue(
    currentRecordSortsComponentState,
  );

  const setRecordIndexAllRecordIdsSelector = useSetRecoilComponentState(
    recordIndexAllRecordIdsComponentSelector,
  );

  const { filterValueDependencies } = useFilterValueDependencies();

  const requestFilters = computeRecordGqlOperationFilter({
    filterValueDependencies,
    recordFilters: currentRecordFilters,
    recordFilterGroups: currentRecordFilterGroups,
    fields: objectMetadataItem.fields,
  });

  const anyFieldFilterValue = useRecoilComponentValue(
    anyFieldFilterValueComponentState,
  );

  const { recordGqlOperationFilter: anyFieldFilter } =
    turnAnyFieldFilterIntoRecordGqlFilter({
      objectMetadataItem,
      filterValue: anyFieldFilterValue,
    });

  const { dateRangeFilter } = useRecordCalendarQueryDateRangeFilter(
    recordCalendarSelectedDate,
  );

  const orderBy = turnSortsIntoOrderBy(objectMetadataItem, currentRecordSorts);

  const combinedFilters = combineFilters([
    anyFieldFilter,
    requestFilters,
    dateRangeFilter,
  ]);


  const objectNameSingular = objectMetadataItem.nameSingular;


  const params = useFindManyRecordIndexTableParams(objectNameSingular);

  const recordGqlFields = useRecordFieldGqlFields({ objectMetadataItem });

  const { records } = useFindManyRecords(
    {
      ...params,
      limit: 100,
      recordGqlFields,
    },
  );

  useEffect(() => {
    upsertRecordsInStore(records);
    setRecordIndexAllRecordIdsSelector(records.map((record) => record.id));
  }, [records, setRecordIndexAllRecordIdsSelector, upsertRecordsInStore]);

  return <></>;
};
