import { useCallback } from 'react';
import { useStore } from 'jotai';

import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { usePerformViewAPIUpdate } from '@/views/hooks/internal/usePerformViewAPIUpdate';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { useCloseAndResetViewPicker } from '@/views/view-picker/hooks/useCloseAndResetViewPicker';
import { viewPickerInputNameComponentState } from '@/views/view-picker/states/viewPickerInputNameComponentState';
import { viewPickerIsDirtyComponentState } from '@/views/view-picker/states/viewPickerIsDirtyComponentState';
import { viewPickerIsPersistingComponentState } from '@/views/view-picker/states/viewPickerIsPersistingComponentState';
import { viewPickerModeComponentState } from '@/views/view-picker/states/viewPickerModeComponentState';
import { viewPickerParentViewIdComponentState } from '@/views/view-picker/states/viewPickerParentViewIdComponentState';
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

  const viewPickerModeCallbackState = useAtomComponentStateCallbackState(
    viewPickerModeComponentState,
  );

  const viewPickerReferenceViewIdCallbackState =
    useAtomComponentStateCallbackState(viewPickerReferenceViewIdComponentState);

  const viewPickerVisibilityCallbackState = useAtomComponentStateCallbackState(
    viewPickerVisibilityComponentState,
  );

  const viewPickerParentViewIdCallbackState =
    useAtomComponentStateCallbackState(viewPickerParentViewIdComponentState);

  const { performViewAPIUpdate } = usePerformViewAPIUpdate();

  const store = useStore();

  const updateViewFromCurrentState = useCallback(async () => {
    if (!canPersistChanges) {
      closeAndResetViewPicker();
      return;
    }

    store.set(viewPickerIsPersistingCallbackState, true);
    store.set(viewPickerIsDirtyCallbackState, false);
    store.set(viewPickerModeCallbackState, 'list');

    const viewPickerReferenceViewId = store.get(
      viewPickerReferenceViewIdCallbackState,
    );
    const viewPickerInputName = store.get(viewPickerInputNameCallbackState);
    const viewPickerSelectedIcon = store.get(
      viewPickerSelectedIconCallbackState,
    );
    const visibility = store.get(viewPickerVisibilityCallbackState);
    const parentViewId = store.get(viewPickerParentViewIdCallbackState);

    try {
      await performViewAPIUpdate({
        id: viewPickerReferenceViewId,
        input: {
          name: viewPickerInputName,
          icon: viewPickerSelectedIcon,
          visibility: visibility,
          parentViewId: parentViewId === '' ? null : parentViewId,
        },
      });
    } finally {
      store.set(viewPickerIsPersistingCallbackState, false);
    }
  }, [
    canPersistChanges,
    viewPickerIsPersistingCallbackState,
    viewPickerIsDirtyCallbackState,
    viewPickerModeCallbackState,
    closeAndResetViewPicker,
    viewPickerReferenceViewIdCallbackState,
    viewPickerInputNameCallbackState,
    viewPickerSelectedIconCallbackState,
    viewPickerVisibilityCallbackState,
    viewPickerParentViewIdCallbackState,
    performViewAPIUpdate,
    store,
  ]);

  return {
    updateViewFromCurrentState,
  };
};
