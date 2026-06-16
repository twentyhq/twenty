import { useRecordIndexTableLazyQuery } from '@/object-record/record-index/hooks/useRecordIndexTableLazyQuery';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';

import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { recordTableWentFromEmptyToNotEmptyComponentState } from '@/object-record/record-table/states/recordTableWentFromEmptyToNotEmptyComponentState';
import { useTriggerInitialRecordTableDataLoad } from '@/object-record/record-table/virtualization/hooks/useTriggerInitialRecordTableDataLoad';
import { isInitializingVirtualTableDataLoadingComponentState } from '@/object-record/record-table/virtualization/states/isInitializingVirtualTableDataLoadingComponentState';
import { lastContextStoreVirtualizedViewIdComponentState } from '@/object-record/record-table/virtualization/states/lastContextStoreVirtualizedViewIdComponentState';
import { lastContextStoreVirtualizedVisibleRecordFieldsComponentState } from '@/object-record/record-table/virtualization/states/lastContextStoreVirtualizedVisibleRecordFieldsComponentState';
import { lastRecordTableQueryIdentifierComponentState } from '@/object-record/record-table/virtualization/states/lastRecordTableQueryIdentifierComponentState';
import { lastRecordTableRecordSortsSignatureComponentState } from '@/object-record/record-table/virtualization/states/lastRecordTableRecordSortsSignatureComponentState';
import { isFetchingMoreRecordsFamilyState } from '@/object-record/states/isFetchingMoreRecordsFamilyState';
import { scrollWrapperScrollLeftComponentState } from '@/ui/utilities/scroll/states/scrollWrapperScrollLeftComponentState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useStore } from 'jotai';
import isEmpty from 'lodash.isempty';
import { useEffect, useState } from 'react';

// TODO: see if we can merge the initial and load more processes, to have only one load at scroll index effect
export const RecordTableVirtualizedInitialDataLoadEffect = () => {
  const { recordTableId, objectNameSingular } = useRecordTableContextOrThrow();
  const recordTableScrollWrapperId = `record-table-scroll-${recordTableId}`;

  const { queryIdentifier } = useRecordIndexTableLazyQuery(objectNameSingular);

  const [lastRecordTableQueryIdentifier, setLastRecordTableQueryIdentifier] =
    useAtomComponentState(lastRecordTableQueryIdentifierComponentState);

  const [isInitializedOnMount, setIsInitializedOnMount] = useState(false);

  const visibleRecordFields = useAtomComponentSelectorValue(
    visibleRecordFieldsComponentSelector,
  );

  const scrollWrapperScrollLeftCallbackState =
    useAtomComponentStateCallbackState(
      scrollWrapperScrollLeftComponentState,
      recordTableScrollWrapperId,
    );

  const currentRecordSortsCallbackState = useAtomComponentStateCallbackState(
    currentRecordSortsComponentState,
  );

  const lastRecordTableRecordSortsSignatureCallbackState =
    useAtomComponentStateCallbackState(
      lastRecordTableRecordSortsSignatureComponentState,
    );

  const store = useStore();

  const [isInitializingVirtualTableDataLoading] = useAtomComponentState(
    isInitializingVirtualTableDataLoadingComponentState,
  );

  const [
    recordTableWentFromEmptyToNotEmpty,
    setRecordTableWentFromEmptyToNotEmpty,
  ] = useAtomComponentState(recordTableWentFromEmptyToNotEmptyComponentState);

  const isFetchingMoreRecords = useAtomFamilyStateValue(
    isFetchingMoreRecordsFamilyState,
    recordTableId,
  );

  const { triggerInitialRecordTableDataLoad } =
    useTriggerInitialRecordTableDataLoad();

  const [
    lastContextStoreVirtualizedViewId,
    setLastContextStoreVirtualizedViewId,
  ] = useAtomComponentState(lastContextStoreVirtualizedViewIdComponentState);

  const [
    lastContextStoreVirtualizedVisibleRecordFields,
    setLastContextStoreVirtualizedVisibleRecordFields,
  ] = useAtomComponentState(
    lastContextStoreVirtualizedVisibleRecordFieldsComponentState,
  );

  const { currentView } = useGetCurrentViewOnly();

  useEffect(() => {
    if (isInitializingVirtualTableDataLoading) {
      return;
    }

    // Wait for the atomic batch from loadRecordIndexStates to populate
    // visibleRecordFields before triggering any fetch. This guard must apply
    // to every branch: when the current view is a draft (e.g. an unsaved
    // record-table widget view), it is not in the persisted views store, so
    // currentView is undefined and the view-change branch below never runs.
    if (isEmpty(visibleRecordFields)) {
      return;
    }

    (async () => {
      if ((currentView?.id ?? null) !== lastContextStoreVirtualizedViewId) {
        setLastContextStoreVirtualizedViewId(currentView?.id ?? null);
        setLastRecordTableQueryIdentifier(queryIdentifier);
        setLastContextStoreVirtualizedVisibleRecordFields(visibleRecordFields);
        store.set(
          lastRecordTableRecordSortsSignatureCallbackState,
          JSON.stringify(store.get(currentRecordSortsCallbackState)),
        );

        await triggerInitialRecordTableDataLoad();
      } else if (
        queryIdentifier !== lastRecordTableQueryIdentifier &&
        !isFetchingMoreRecords
      ) {
        setLastRecordTableQueryIdentifier(queryIdentifier);

        const currentRecordSortsSignature = JSON.stringify(
          store.get(currentRecordSortsCallbackState),
        );
        const lastRecordSortsSignature = store.get(
          lastRecordTableRecordSortsSignatureCallbackState,
        );
        const didRecordSortsChange =
          currentRecordSortsSignature !== lastRecordSortsSignature;

        store.set(
          lastRecordTableRecordSortsSignatureCallbackState,
          currentRecordSortsSignature,
        );

        const scrollWrapperScrollLeft = store.get(
          scrollWrapperScrollLeftCallbackState,
        );

        await triggerInitialRecordTableDataLoad({
          horizontalScrollToRestore:
            didRecordSortsChange && scrollWrapperScrollLeft > 0
              ? scrollWrapperScrollLeft
              : undefined,
        });
      } else if (recordTableWentFromEmptyToNotEmpty) {
        setRecordTableWentFromEmptyToNotEmpty(false);

        await triggerInitialRecordTableDataLoad();
      } else if (
        JSON.stringify(lastContextStoreVirtualizedVisibleRecordFields) !==
        JSON.stringify(visibleRecordFields)
      ) {
        const lastFields = lastContextStoreVirtualizedVisibleRecordFields ?? [];
        const currentFields = visibleRecordFields ?? [];

        setLastContextStoreVirtualizedVisibleRecordFields(visibleRecordFields);

        const shouldRefetchData = currentFields.length > lastFields.length;

        if (shouldRefetchData) {
          await triggerInitialRecordTableDataLoad({
            shouldScrollToStart: isEmpty(lastFields),
          });
        }
      } else if (!isInitializedOnMount) {
        setIsInitializedOnMount(true);
        store.set(
          lastRecordTableRecordSortsSignatureCallbackState,
          JSON.stringify(store.get(currentRecordSortsCallbackState)),
        );
        await triggerInitialRecordTableDataLoad();
      }
    })();
  }, [
    recordTableWentFromEmptyToNotEmpty,
    setRecordTableWentFromEmptyToNotEmpty,
    queryIdentifier,
    lastRecordTableQueryIdentifier,
    triggerInitialRecordTableDataLoad,
    setLastRecordTableQueryIdentifier,
    isFetchingMoreRecords,
    isInitializingVirtualTableDataLoading,
    currentView,
    lastContextStoreVirtualizedViewId,
    setLastContextStoreVirtualizedViewId,
    lastContextStoreVirtualizedVisibleRecordFields,
    setLastContextStoreVirtualizedVisibleRecordFields,
    visibleRecordFields,
    currentRecordSortsCallbackState,
    lastRecordTableRecordSortsSignatureCallbackState,
    scrollWrapperScrollLeftCallbackState,
    store,
    isInitializedOnMount,
    setIsInitializedOnMount,
  ]);

  return <></>;
};
