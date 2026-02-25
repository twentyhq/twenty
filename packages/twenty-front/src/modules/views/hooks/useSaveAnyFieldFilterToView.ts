import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { usePerformViewAPIUpdate } from '@/views/hooks/internal/usePerformViewAPIUpdate';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { convertUpdateViewInputToCore } from '@/views/utils/convertUpdateViewInputToCore';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useSaveAnyFieldFilterToView = () => {
  const { canPersistChanges } = useCanPersistViewChanges();
  const { performViewAPIUpdate } = usePerformViewAPIUpdate();

  const { currentView } = useGetCurrentViewOnly();

  const anyFieldFilterValueCallbackState = useAtomComponentStateCallbackState(
    anyFieldFilterValueComponentState,
  );

  const store = useStore();

  const saveAnyFieldFilterToView = useCallback(async () => {
    if (!canPersistChanges || !isDefined(currentView)) {
      return;
    }

    const currentViewAnyFieldFilterValue = currentView.anyFieldFilterValue;

    const currentAnyFieldFilterValue = store.get(
      anyFieldFilterValueCallbackState,
    );

    if (currentAnyFieldFilterValue !== currentViewAnyFieldFilterValue) {
      await performViewAPIUpdate({
        id: currentView.id,
        input: convertUpdateViewInputToCore({
          ...currentView,
          anyFieldFilterValue: currentAnyFieldFilterValue,
        }),
      });
    }
  }, [
    store,
    canPersistChanges,
    performViewAPIUpdate,
    anyFieldFilterValueCallbackState,
    currentView,
  ]);

  return {
    saveAnyFieldFilterToView,
  };
};
