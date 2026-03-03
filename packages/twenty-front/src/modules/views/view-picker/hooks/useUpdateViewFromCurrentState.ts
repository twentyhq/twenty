import { useCallback } from 'react';
import { useStore } from 'jotai';

import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { usePerformViewAPIUpdate } from '@/views/hooks/internal/usePerformViewAPIUpdate';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { useCloseAndResetViewPicker } from '@/views/view-picker/hooks/useCloseAndResetViewPicker';
import { viewPickerInputNameComponentState } from '@/views/view-picker/states/viewPickerInputNameComponentState';
import { viewPickerIsDirtyComponentState } from '@/views/view-picker/states/viewPickerIsDirtyComponentState';
import { viewPickerIsPersistingComponentState } from '@/views/view-picker/states/viewPickerIsPersistingComponentState';
import { viewPickerReferenceViewIdComponentState } from '@/views/view-picker/states/viewPickerReferenceViewIdComponentState';
import { viewPickerSelectedIconComponentState } from '@/views/view-picker/states/viewPickerSelectedIconComponentState';
import { viewPickerVisibilityComponentState } from '@/views/view-picker/states/viewPickerVisibilityComponentState';

export const useUpdateViewFromCurrentState = () => {
  const { canPersistChanges } = useCanPersistViewChanges();
  const { closeAndResetViewPicker } = useCloseAndResetViewPicker();

  const viewPickerInputNameCallbackState = useAtomComponentStateCallbackState(
    viewPickerInputNameComponentState,
  );

  const viewPickerSelectedIconCallbackState =
    useAtomComponentStateCallbackState(viewPickerSelectedIconComponentState);

  const viewPickerIsPersistingCallbackState =
    useAtomComponentStateCallbackState(viewPickerIsPersistingComponentState);

  const viewPickerIsDirtyCallbackState = useAtomComponentStateCallbackState(
    viewPickerIsDirtyComponentState,
  );

  const viewPickerReferenceViewIdCallbackState =
    useAtomComponentStateCallbackState(viewPickerReferenceViewIdComponentState);

  const viewPickerVisibilityCallbackState = useAtomComponentStateCallbackState(
    viewPickerVisibilityComponentState,
  );

  const { performViewAPIUpdate } = usePerformViewAPIUpdate();

  const store = useStore();

  const updateViewFromCurrentState = useCallback(async () => {
    if (!canPersistChanges) {
      closeAndResetViewPicker();
      return;
    }

    store.set(viewPickerIsPersistingCallbackState, true);
    store.set(viewPickerIsDirtyCallbackState, false);
    closeAndResetViewPicker();

    const viewPickerReferenceViewId = store.get(
      viewPickerReferenceViewIdCallbackState,
    );
    const viewPickerInputName = store.get(viewPickerInputNameCallbackState);
    const viewPickerSelectedIcon = store.get(
      viewPickerSelectedIconCallbackState,
    );
    const visibility = store.get(viewPickerVisibilityCallbackState);

    await performViewAPIUpdate({
      id: viewPickerReferenceViewId,
      input: {
        name: viewPickerInputName,
        icon: viewPickerSelectedIcon,
        visibility: visibility,
      },
    });
  }, [
    canPersistChanges,
    viewPickerIsPersistingCallbackState,
    viewPickerIsDirtyCallbackState,
    closeAndResetViewPicker,
    viewPickerReferenceViewIdCallbackState,
    viewPickerInputNameCallbackState,
    viewPickerSelectedIconCallbackState,
    viewPickerVisibilityCallbackState,
    performViewAPIUpdate,
    store,
  ]);

  return {
    updateViewFromCurrentState,
  };
};
