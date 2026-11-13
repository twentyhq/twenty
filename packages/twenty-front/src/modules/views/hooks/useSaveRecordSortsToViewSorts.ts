import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useSaveRecordSortsToView } from '@/views/hooks/useSaveRecordSortsToView';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useSaveRecordSortsToViewSorts = () => {
  const { canPersistChanges } = useCanPersistViewChanges();
  const { saveRecordSortsToView } = useSaveRecordSortsToView();

  const { currentView } = useGetCurrentViewOnly();

  const currentRecordSortsCallbackState = useAtomComponentStateCallbackState(
    currentRecordSortsComponentState,
  );

  const store = useStore();

  const saveRecordSortsToViewSorts = useCallback(async () => {
    if (!canPersistChanges || !isDefined(currentView)) {
      return;
    }

    await saveRecordSortsToView({
      view: currentView,
      recordSorts: store.get(currentRecordSortsCallbackState),
    });
  }, [
    canPersistChanges,
    currentView,
    store,
    currentRecordSortsCallbackState,
    saveRecordSortsToView,
  ]);

  return {
    saveRecordSortsToViewSorts,
  };
};
