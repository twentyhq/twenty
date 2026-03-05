import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { type ObjectRecordOperationBrowserEventDetail } from '@/browser-event/types/ObjectRecordOperationBrowserEventDetail';
import { turnSortsIntoOrderBy } from '@/object-record/object-sort-dropdown/utils/turnSortsIntoOrderBy';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { recordIndexHasRecordsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexHasRecordsComponentSelector';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { isRecordTableInitialLoadingComponentState } from '@/object-record/record-table/states/isRecordTableInitialLoadingComponentState';
import { recordTableWentFromEmptyToNotEmptyComponentState } from '@/object-record/record-table/states/recordTableWentFromEmptyToNotEmptyComponentState';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

import { useStore } from 'jotai';
import { useMemo } from 'react';
import { computeRecordGqlOperationFilter } from 'twenty-shared/utils';

export const RecordTableEmptyHasNewRecordEffect = () => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const store = useStore();

  const isRecordTableInitialLoading = useAtomComponentStateValue(
    isRecordTableInitialLoadingComponentState,
  );

  const recordTableHasRecords = useAtomComponentSelectorValue(
    recordIndexHasRecordsComponentSelector,
  );

  const recordTableWentFromEmptyToNotEmptyCallbackState =
    useAtomComponentStateCallbackState(
      recordTableWentFromEmptyToNotEmptyComponentState,
    );

  const { filterValueDependencies } = useFilterValueDependencies();

  const currentRecordFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
  );

  const currentRecordSorts = useAtomComponentStateValue(
    currentRecordSortsComponentState,
  );

  const currentRecordFilterGroups = useAtomComponentStateValue(
    currentRecordFilterGroupsComponentState,
  );

  const queryId = `record-table-empty-${objectMetadataItem.nameSingular}`;

  const operationSignature = useMemo(
    () => ({
      objectNameSingular: objectMetadataItem.nameSingular,
      variables: {
        filter: computeRecordGqlOperationFilter({
          fields: objectMetadataItem.fields,
          recordFilters: currentRecordFilters,
          recordFilterGroups: currentRecordFilterGroups,
          filterValueDependencies,
        }),
        orderBy: turnSortsIntoOrderBy(objectMetadataItem, currentRecordSorts),
      },
    }),
    [
      objectMetadataItem,
      currentRecordFilters,
      currentRecordFilterGroups,
      filterValueDependencies,
      currentRecordSorts,
    ],
  );

  useListenToEventsForQuery({
    queryId,
    operationSignature,
  });

  const handleObjectRecordOperation = (
    objectRecordOperationEventDetail: ObjectRecordOperationBrowserEventDetail,
  ) => {
    const objectRecordOperation = objectRecordOperationEventDetail.operation;

    if (
      objectRecordOperation.type.includes('update') ||
      objectRecordOperation.type.includes('create')
    ) {
      if (!isRecordTableInitialLoading && !recordTableHasRecords) {
        store.set(recordTableWentFromEmptyToNotEmptyCallbackState, true);
      }
    }
  };

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: handleObjectRecordOperation,
    objectMetadataItemId: objectMetadataItem.id,
  });

  return null;
};
