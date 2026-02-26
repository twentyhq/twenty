import { useRecordIndexTableFetchMore } from '@/object-record/record-index/hooks/useRecordIndexTableFetchMore';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';

import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { useTriggerInitialRecordTableDataLoad } from '@/object-record/record-table/virtualization/hooks/useTriggerInitialRecordTableDataLoad';
import { isInitializingVirtualTableDataLoadingComponentState } from '@/object-record/record-table/virtualization/states/isInitializingVirtualTableDataLoadingComponentState';
import { lastContextStoreVirtualizedViewIdComponentState } from '@/object-record/record-table/virtualization/states/lastContextStoreVirtualizedViewIdComponentState';
import { lastContextStoreVirtualizedVisibleRecordFieldsComponentState } from '@/object-record/record-table/virtualization/states/lastContextStoreVirtualizedVisibleRecordFieldsComponentState';
import { lastRecordTableQueryIdentifierComponentState } from '@/object-record/record-table/virtualization/states/lastRecordTableQueryIdentifierComponentState';
import { isFetchingMoreRecordsFamilyState } from '@/object-record/states/isFetchingMoreRecordsFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import isEmpty from 'lodash.isempty';
import { useEffect, useRef } from 'react';

export const RecordTableVirtualizedInitialDataLoadEffect = () => {
  const { recordTableId, objectNameSingular } = useRecordTableContextOrThrow();

  const { queryIdentifier } = useRecordIndexTableFetchMore(objectNameSingular);

  const [lastRecordTableQueryIdentifier, setLastRecordTableQueryIdentifier] =
    useAtomComponentState(lastRecordTableQueryIdentifierComponentState);

  const visibleRecordFields = useAtomComponentSelectorValue(
    visibleRecordFieldsComponentSelector,
  );
  const [isInitializingVirtualTableDataLoading] = useAtomComponentState(
    isInitializingVirtualTableDataLoadingComponentState,
  );

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

  const currentViewId = currentView?.id ?? null;

  const triggerInitialRecordTableDataLoadRef = useRef(
    triggerInitialRecordTableDataLoad,
  );
  triggerInitialRecordTableDataLoadRef.current =
    triggerInitialRecordTableDataLoad;

  const setLastRecordTableQueryIdentifierRef = useRef(
    setLastRecordTableQueryIdentifier,
  );
  setLastRecordTableQueryIdentifierRef.current =
    setLastRecordTableQueryIdentifier;

  const setLastContextStoreVirtualizedViewIdRef = useRef(
    setLastContextStoreVirtualizedViewId,
  );
  setLastContextStoreVirtualizedViewIdRef.current =
    setLastContextStoreVirtualizedViewId;

  const setLastContextStoreVirtualizedVisibleRecordFieldsRef = useRef(
    setLastContextStoreVirtualizedVisibleRecordFields,
  );
  setLastContextStoreVirtualizedVisibleRecordFieldsRef.current =
    setLastContextStoreVirtualizedVisibleRecordFields;

  const visibleRecordFieldsRef = useRef(visibleRecordFields);
  visibleRecordFieldsRef.current = visibleRecordFields;

  const queryIdentifierRef = useRef(queryIdentifier);
  queryIdentifierRef.current = queryIdentifier;

  useEffect(() => {
    if (isInitializingVirtualTableDataLoading) {
      return;
    }

    (async () => {
      if (currentViewId !== lastContextStoreVirtualizedViewId) {
        if (isEmpty(visibleRecordFieldsRef.current)) {
          return;
        }

        setLastContextStoreVirtualizedViewIdRef.current(currentViewId);
        setLastRecordTableQueryIdentifierRef.current(
          queryIdentifierRef.current,
        );
        setLastContextStoreVirtualizedVisibleRecordFieldsRef.current(
          visibleRecordFieldsRef.current,
        );

        await triggerInitialRecordTableDataLoadRef.current();
      } else if (
        queryIdentifier !== lastRecordTableQueryIdentifier &&
        !isFetchingMoreRecords
      ) {
        setLastRecordTableQueryIdentifierRef.current(queryIdentifier);

        await triggerInitialRecordTableDataLoadRef.current();
      } else if (
        JSON.stringify(lastContextStoreVirtualizedVisibleRecordFields) !==
        JSON.stringify(visibleRecordFields)
      ) {
        const lastFields =
          lastContextStoreVirtualizedVisibleRecordFields || [];
        const currentFields = visibleRecordFields || [];

        setLastContextStoreVirtualizedVisibleRecordFieldsRef.current(
          visibleRecordFields,
        );

        const shouldRefetchData = currentFields.length > lastFields.length;

        if (shouldRefetchData) {
          await triggerInitialRecordTableDataLoadRef.current({
            shouldScrollToStart: isEmpty(lastFields),
          });
        }
      }
    })();
  }, [
    queryIdentifier,
    lastRecordTableQueryIdentifier,
    isFetchingMoreRecords,
    isInitializingVirtualTableDataLoading,
    currentViewId,
    lastContextStoreVirtualizedViewId,
    lastContextStoreVirtualizedVisibleRecordFields,
    visibleRecordFields,
  ]);

  return <></>;
};
