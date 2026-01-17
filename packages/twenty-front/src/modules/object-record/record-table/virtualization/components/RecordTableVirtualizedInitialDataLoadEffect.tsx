import { useRecoilValue } from 'recoil';

import { lastFieldMetadataItemUpdateState } from '@/object-metadata/states/lastFieldMetadataItemUpdateState';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { useRecordIndexTableFetchMore } from '@/object-record/record-index/hooks/useRecordIndexTableFetchMore';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useResetVirtualizationBecauseDataChanged } from '@/object-record/record-table/virtualization/hooks/useResetVirtualizationBecauseDataChanged';
import { useTriggerInitialRecordTableDataLoad } from '@/object-record/record-table/virtualization/hooks/useTriggerInitialRecordTableDataLoad';
import { isInitializingVirtualTableDataLoadingComponentState } from '@/object-record/record-table/virtualization/states/isInitializingVirtualTableDataLoadingComponentState';
import { lastContextStoreVirtualizedViewIdComponentState } from '@/object-record/record-table/virtualization/states/lastContextStoreVirtualizedViewIdComponentState';
import { lastContextStoreVirtualizedVisibleRecordFieldsComponentState } from '@/object-record/record-table/virtualization/states/lastContextStoreVirtualizedVisibleRecordFieldsComponentState';
import { lastProcessedFieldMetadataUpdateComponentState } from '@/object-record/record-table/virtualization/states/lastProcessedFieldMetadataUpdateComponentState';
import { lastRecordTableQueryIdentifierComponentState } from '@/object-record/record-table/virtualization/states/lastRecordTableQueryIdentifierComponentState';
import { isFetchingMoreRecordsFamilyState } from '@/object-record/states/isFetchingMoreRecordsFamilyState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import isEmpty from 'lodash.isempty';
import { useEffect } from 'react';

// TODO: see if we can merge the initial and load more processes, to have only one load at scroll index effect
export const RecordTableVirtualizedInitialDataLoadEffect = () => {
  const { recordTableId, objectNameSingular } = useRecordTableContextOrThrow();

  const { queryIdentifier } = useRecordIndexTableFetchMore(objectNameSingular);

  const [lastRecordTableQueryIdentifier, setLastRecordTableQueryIdentifier] =
    useRecoilComponentState(lastRecordTableQueryIdentifierComponentState);

  const visibleRecordFields = useRecoilComponentValue(
    visibleRecordFieldsComponentSelector,
  );
  const [isInitializingVirtualTableDataLoading] = useRecoilComponentState(
    isInitializingVirtualTableDataLoadingComponentState,
  );

  const isFetchingMoreRecords = useRecoilValue(
    isFetchingMoreRecordsFamilyState(recordTableId),
  );

  const { triggerInitialRecordTableDataLoad } =
    useTriggerInitialRecordTableDataLoad();

  const { resetVirtualizationBecauseDataChanged } =
    useResetVirtualizationBecauseDataChanged(objectNameSingular);

  const [
    lastContextStoreVirtualizedViewId,
    setLastContextStoreVirtualizedViewId,
  ] = useRecoilComponentState(lastContextStoreVirtualizedViewIdComponentState);

  const [
    lastContextStoreVisibleRecordFields,
    setLastContextStoreVisibleRecordFields,
  ] = useRecoilComponentState(
    lastContextStoreVirtualizedVisibleRecordFieldsComponentState,
  );

  const { currentView } = useGetCurrentViewOnly();

  useEffect(() => {
    if (isInitializingVirtualTableDataLoading) {
      return;
    }

    (async () => {
      if ((currentView?.id ?? null) !== lastContextStoreVirtualizedViewId) {
        setLastContextStoreVirtualizedViewId(currentView?.id ?? null);

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
        setLastContextStoreVisibleRecordFields(visibleRecordFields);

        const lastFields = lastContextStoreVisibleRecordFields || [];
        const currentFields = visibleRecordFields || [];

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

  const lastFieldMetadataItemUpdate = useRecoilValue(
    lastFieldMetadataItemUpdateState,
  );

  const [
    lastProcessedFieldMetadataUpdate,
    setLastProcessedFieldMetadataUpdate,
  ] = useRecoilComponentState(lastProcessedFieldMetadataUpdateComponentState);

  useEffect(() => {
    if (!lastFieldMetadataItemUpdate) {
      return;
    }

    if (
      lastFieldMetadataItemUpdate.timestamp === lastProcessedFieldMetadataUpdate
    ) {
      return;
    }

    const isFieldInCurrentView = visibleRecordFields.some(
      (field) =>
        field.fieldMetadataItemId ===
        lastFieldMetadataItemUpdate.fieldMetadataItemId,
    );

    if (isFieldInCurrentView) {
      setLastProcessedFieldMetadataUpdate(
        lastFieldMetadataItemUpdate.timestamp,
      );
      resetVirtualizationBecauseDataChanged();
    }
  }, [
    lastFieldMetadataItemUpdate,
    lastProcessedFieldMetadataUpdate,
    setLastProcessedFieldMetadataUpdate,
    visibleRecordFields,
    resetVirtualizationBecauseDataChanged,
  ]);

  return <></>;
};
