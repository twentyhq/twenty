import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { usePersistView } from '@/views/hooks/internal/usePersistView';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { useChangeView } from '@/views/hooks/useChangeView';
import { useCloseAndResetViewPicker } from '@/views/view-picker/hooks/useCloseAndResetViewPicker';
import { viewPickerInputNameComponentState } from '@/views/view-picker/states/viewPickerInputNameComponentState';
import { viewPickerIsDirtyComponentState } from '@/views/view-picker/states/viewPickerIsDirtyComponentState';
import { viewPickerIsPersistingComponentState } from '@/views/view-picker/states/viewPickerIsPersistingComponentState';
import { viewPickerReferenceViewIdComponentState } from '@/views/view-picker/states/viewPickerReferenceViewIdComponentState';
import { viewPickerSelectedIconComponentState } from '@/views/view-picker/states/viewPickerSelectedIconComponentState';
import { viewPickerVisibilityComponentState } from '@/views/view-picker/states/viewPickerVisibilityComponentState';
import { useRecoilCallback } from 'recoil';

export const useUpdateViewFromCurrentState = () => {
  const { canPersistChanges } = useCanPersistViewChanges();
  const { closeAndResetViewPicker } = useCloseAndResetViewPicker();

  const viewPickerInputNameCallbackState = useRecoilComponentCallbackState(
    viewPickerInputNameComponentState,
  );

  const viewPickerSelectedIconCallbackState = useRecoilComponentCallbackState(
    viewPickerSelectedIconComponentState,
  );

  const viewPickerIsPersistingCallbackState = useRecoilComponentCallbackState(
    viewPickerIsPersistingComponentState,
  );

  const viewPickerIsDirtyCallbackState = useRecoilComponentCallbackState(
    viewPickerIsDirtyComponentState,
  );

  const viewPickerReferenceViewIdCallbackState =
    useRecoilComponentCallbackState(viewPickerReferenceViewIdComponentState);

  const viewPickerVisibilityCallbackState = useRecoilComponentCallbackState(
    viewPickerVisibilityComponentState,
  );

  const { updateView } = usePersistView();
  const { changeView } = useChangeView();

  const updateViewFromCurrentState = useRecoilCallback(
    ({ set, snapshot }) =>
      async () => {
        if (!canPersistChanges) {
          closeAndResetViewPicker();
          return;
        }

        set(viewPickerIsPersistingCallbackState, true);
        set(viewPickerIsDirtyCallbackState, false);
        closeAndResetViewPicker();

        const viewPickerReferenceViewId = getSnapshotValue(
          snapshot,
          viewPickerReferenceViewIdCallbackState,
        );
        const viewPickerInputName = getSnapshotValue(
          snapshot,
          viewPickerInputNameCallbackState,
        );
        const viewPickerSelectedIcon = getSnapshotValue(
          snapshot,
          viewPickerSelectedIconCallbackState,
        );
        const visibility = getSnapshotValue(
          snapshot,
          viewPickerVisibilityCallbackState,
        );

        await updateView({
          id: viewPickerReferenceViewId,
          input: {
            name: viewPickerInputName,
            icon: viewPickerSelectedIcon,
            visibility: visibility,
          },
        });
        changeView(viewPickerReferenceViewId);
      },
    [
      canPersistChanges,
      viewPickerIsPersistingCallbackState,
      viewPickerIsDirtyCallbackState,
      closeAndResetViewPicker,
      viewPickerReferenceViewIdCallbackState,
      viewPickerInputNameCallbackState,
      viewPickerSelectedIconCallbackState,
      viewPickerVisibilityCallbackState,
      updateView,
      changeView,
    ],
  );

  return {
    updateViewFromCurrentState,
  };
};
