import { useRecoilValue } from 'recoil';

import { useRecordIndexTableFetchMore } from '@/object-record/record-index/hooks/useRecordIndexTableFetchMore';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';

import { useTriggerInitialRecordTableDataLoad } from '@/object-record/record-table/virtualization/hooks/useTriggerInitialRecordTableDataLoad';
import { isInitializingVirtualTableDataLoadingComponentState } from '@/object-record/record-table/virtualization/states/isInitializingVirtualTableDataLoadingComponentState';
import { lastRecordTableQueryIdentifierComponentState } from '@/object-record/record-table/virtualization/states/lastRecordTableQueryIdentifierComponentState';
import { isFetchingMoreRecordsFamilyState } from '@/object-record/states/isFetchingMoreRecordsFamilyState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useEffect } from 'react';

export const RecordTableVirtualizedInitialDataLoadEffect = () => {
  const { recordTableId, objectNameSingular } = useRecordTableContextOrThrow();

  const { queryIdentifier } = useRecordIndexTableFetchMore(objectNameSingular);

  const [lastRecordTableQueryIdentifier, setLastRecordTableQueryIdentifier] =
    useRecoilComponentState(lastRecordTableQueryIdentifierComponentState);

  const [isInitializingVirtualTableDataLoading] = useRecoilComponentState(
    isInitializingVirtualTableDataLoadingComponentState,
  );

  const isFetchingMoreRecords = useRecoilValue(
    isFetchingMoreRecordsFamilyState(recordTableId),
  );

  const { triggerInitialRecordTableDataLoad } =
    useTriggerInitialRecordTableDataLoad();

  useEffect(() => {
    if (isInitializingVirtualTableDataLoading) {
      return;
    }

    (async () => {
      if (
        queryIdentifier !== lastRecordTableQueryIdentifier &&
        !isFetchingMoreRecords
      ) {
        setLastRecordTableQueryIdentifier(queryIdentifier);

        await triggerInitialRecordTableDataLoad();
      }
    })();
  }, [
    queryIdentifier,
    lastRecordTableQueryIdentifier,
    triggerInitialRecordTableDataLoad,
    setLastRecordTableQueryIdentifier,
    isFetchingMoreRecords,
    isInitializingVirtualTableDataLoading,
  ]);

  return <></>;
};
