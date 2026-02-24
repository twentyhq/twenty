import { useRecordIndexTableFetchMore } from '@/object-record/record-index/hooks/useRecordIndexTableFetchMore';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';

import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { useTriggerInitialRecordTableDataLoad } from '@/object-record/record-table/virtualization/hooks/useTriggerInitialRecordTableDataLoad';
import { isInitializingVirtualTableDataLoadingComponentState } from '@/object-record/record-table/virtualization/states/isInitializingVirtualTableDataLoadingComponentState';
import { lastContextStoreVirtualizedViewIdComponentState } from '@/object-record/record-table/virtualization/states/lastContextStoreVirtualizedViewIdComponentState';
import { lastContextStoreVirtualizedVisibleRecordFieldsComponentState } from '@/object-record/record-table/virtualization/states/lastContextStoreVirtualizedVisibleRecordFieldsComponentState';
import { lastRecordTableQueryIdentifierComponentState } from '@/object-record/record-table/virtualization/states/lastRecordTableQueryIdentifierComponentState';
import { isFetchingMoreRecordsFamilyState } from '@/object-record/states/isFetchingMoreRecordsFamilyState';
import { useFamilyRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useFamilyRecoilValueV2';
import { useRecoilComponentSelectorValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentSelectorValueV2';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateV2';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import isEmpty from 'lodash.isempty';
import { useEffect } from 'react';

// TODO: see if we can merge the initial and load more processes, to have only one load at scroll index effect
export const RecordTableVirtualizedInitialDataLoadEffect = () => {
  const { recordTableId, objectNameSingular } = useRecordTableContextOrThrow();

  const { queryIdentifier } = useRecordIndexTableFetchMore(objectNameSingular);

  const [lastRecordTableQueryIdentifier, setLastRecordTableQueryIdentifier] =
    useRecoilComponentStateV2(lastRecordTableQueryIdentifierComponentState);

  const visibleRecordFields = useRecoilComponentSelectorValueV2(
    visibleRecordFieldsComponentSelector,
  );
  const [isInitializingVirtualTableDataLoading] = useRecoilComponentStateV2(
    isInitializingVirtualTableDataLoadingComponentState,
  );

  const isFetchingMoreRecords = useFamilyRecoilValueV2(
    isFetchingMoreRecordsFamilyState,
    recordTableId,
  );

  const { triggerInitialRecordTableDataLoad } =
    useTriggerInitialRecordTableDataLoad();

  const [
    lastContextStoreVirtualizedViewId,
    setLastContextStoreVirtualizedViewId,
  ] = useRecoilComponentStateV2(
    lastContextStoreVirtualizedViewIdComponentState,
  );

  const [
    lastContextStoreVisibleRecordFields,
    setLastContextStoreVisibleRecordFields,
  ] = useRecoilComponentStateV2(
    lastContextStoreVirtualizedVisibleRecordFieldsComponentState,
  );

  const { currentView } = useGetCurrentViewOnly();

  useEffect(() => {
    if (isInitializingVirtualTableDataLoading) {
      return;
    }

    (async () => {
      if ((currentView?.id ?? null) !== lastContextStoreVirtualizedViewId) {
        // Wait for the atomic batch from loadRecordIndexStates to populate
        // visibleRecordFields before triggering a fetch. On the next render
        // after the batch, fields will be populated and we'll proceed.
        if (isEmpty(visibleRecordFields)) {
          return;
        }

        setLastContextStoreVirtualizedViewId(currentView?.id ?? null);
        setLastRecordTableQueryIdentifier(queryIdentifier);
        setLastContextStoreVisibleRecordFields(visibleRecordFields);

        await triggerInitialRecordTableDataLoad();
      } else if (
        queryIdentifier !== lastRecordTableQueryIdentifier &&
        !isFetchingMoreRecords
      ) {
        setLastRecordTableQueryIdentifier(queryIdentifier);

        await triggerInitialRecordTableDataLoad();
      } else if (
        JSON.stringify(lastContextStoreVisibleRecordFields) !==
        JSON.stringify(visibleRecordFields)
      ) {
        const lastFields = lastContextStoreVisibleRecordFields || [];
        const currentFields = visibleRecordFields || [];

        setLastContextStoreVisibleRecordFields(visibleRecordFields);

        const shouldRefetchData = currentFields.length > lastFields.length;

        if (shouldRefetchData) {
          await triggerInitialRecordTableDataLoad({
            shouldScrollToStart: isEmpty(lastFields),
          });
        }
      }
    })();
  }, [
    queryIdentifier,
    lastRecordTableQueryIdentifier,
    triggerInitialRecordTableDataLoad,
    setLastRecordTableQueryIdentifier,
    isFetchingMoreRecords,
    isInitializingVirtualTableDataLoading,
    currentView,
    lastContextStoreVirtualizedViewId,
    setLastContextStoreVirtualizedViewId,
    lastContextStoreVisibleRecordFields,
    setLastContextStoreVisibleRecordFields,
    visibleRecordFields,
  ]);

  return <></>;
};
