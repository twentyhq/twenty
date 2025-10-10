import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useResetVirtualizationBecauseDataChanged } from '@/object-record/record-table/virtualization/hooks/useResetVirtualizationBecauseDataChanged';
import { useTriggerInitialRecordTableDataLoad } from '@/object-record/record-table/virtualization/hooks/useTriggerInitialRecordTableDataLoad';
import { lastContextStoreVirtualizedViewIdComponentState } from '@/object-record/record-table/virtualization/states/lastContextStoreVirtualizedViewIdComponentState';
import { useScrollToPosition } from '@/ui/utilities/scroll/hooks/useScrollToPosition';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useEffect } from 'react';

export const ContextStoreVirtualizedViewChangedEffect = () => {
  const { objectNameSingular } = useRecordTableContextOrThrow();

  const { resetVirtualizationBecauseDataChanged } =
    useResetVirtualizationBecauseDataChanged(objectNameSingular);

  const [
    lastContextStoreVirtualizedViewId,
    setLastContextStoreVirtualizedViewId,
  ] = useRecoilComponentState(lastContextStoreVirtualizedViewIdComponentState);

  const { currentView } = useGetCurrentViewOnly();

  const { scrollToPosition } = useScrollToPosition();

  const { triggerInitialRecordTableDataLoad } =
    useTriggerInitialRecordTableDataLoad();

  useEffect(() => {
    if (currentView?.id !== lastContextStoreVirtualizedViewId) {
      setLastContextStoreVirtualizedViewId(currentView?.id ?? null);

      triggerInitialRecordTableDataLoad();
    }
  }, [
    currentView,
    lastContextStoreVirtualizedViewId,
    setLastContextStoreVirtualizedViewId,
    triggerInitialRecordTableDataLoad,
    resetVirtualizationBecauseDataChanged,
    scrollToPosition,
  ]);

  return <></>;
};
