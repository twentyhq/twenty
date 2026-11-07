import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { type ObjectRecordOperationBrowserEventDetail } from '@/browser-event/types/ObjectRecordOperationBrowserEventDetail';
import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { turnSortsIntoOrderBy } from '@/object-record/object-sort-dropdown/utils/turnSortsIntoOrderBy';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordIndexAdditionalFilter } from '@/object-record/record-index/hooks/useRecordIndexAdditionalFilter';
import { useRecordIndexQueryRecordFilters } from '@/object-record/record-index/hooks/useRecordIndexQueryRecordFilters';
import { recordIndexHasRecordsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexHasRecordsComponentSelector';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { isRecordTableInitialLoadingComponentState } from '@/object-record/record-table/states/isRecordTableInitialLoadingComponentState';
import { recordTableWentFromEmptyToNotEmptyComponentState } from '@/object-record/record-table/states/recordTableWentFromEmptyToNotEmptyComponentState';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

import { useStore } from 'jotai';
import { useCallback, useMemo } from 'react';
import {
  combineFilters,
  computeRecordGqlOperationFilter,
} from 'twenty-shared/utils';

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

  const flattenedFieldMetadataItems = useAtomStateValue(
    flattenedFieldMetadataItemsSelector,
  );

  const {
    recordFilters: currentRecordFilters,
    recordFilterGroups: currentRecordFilterGroups,
  } = useRecordIndexQueryRecordFilters();

  const currentRecordSorts = useAtomComponentStateValue(
    currentRecordSortsComponentState,
  );

  const additionalFilter = useRecordIndexAdditionalFilter();

  const queryId = `record-table-empty-${objectMetadataItem.nameSingular}`;

  const operationSignature = useMemo(
    () => ({
      objectNameSingular: objectMetadataItem.nameSingular,
      variables: {
        filter: combineFilters([
          computeRecordGqlOperationFilter({
            fieldMetadataItems: flattenedFieldMetadataItems,
            recordFilters: currentRecordFilters,
            recordFilterGroups: currentRecordFilterGroups,
            filterValueDependencies,
          }),
          additionalFilter,
        ]),
        orderBy: turnSortsIntoOrderBy(objectMetadataItem, currentRecordSorts),
      },
    }),
    [
      objectMetadataItem,
      currentRecordFilters,
      currentRecordFilterGroups,
      filterValueDependencies,
      currentRecordSorts,
      flattenedFieldMetadataItems,
      additionalFilter,
    ],
  );

  useListenToEventsForQuery({
    queryId,
    operationSignature,
  });

  const handleObjectRecordOperation = useCallback(
    (
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
    },
    [
      recordTableHasRecords,
      isRecordTableInitialLoading,
      store,
      recordTableWentFromEmptyToNotEmptyCallbackState,
    ],
  );

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: handleObjectRecordOperation,
    objectMetadataItemId: objectMetadataItem.id,
  });

  return null;
};
