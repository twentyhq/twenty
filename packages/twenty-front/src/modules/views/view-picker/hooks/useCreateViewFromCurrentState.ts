import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useChangeView } from '@/views/hooks/useChangeView';
import { useCreateViewFromCurrentView } from '@/views/hooks/useCreateViewFromCurrentView';
import { useCloseAndResetViewPicker } from '@/views/view-picker/hooks/useCloseAndResetViewPicker';
import { viewPickerInputNameComponentState } from '@/views/view-picker/states/viewPickerInputNameComponentState';
import { viewPickerIsDirtyComponentState } from '@/views/view-picker/states/viewPickerIsDirtyComponentState';
import { viewPickerIsPersistingComponentState } from '@/views/view-picker/states/viewPickerIsPersistingComponentState';
import { viewPickerKanbanFieldMetadataIdComponentState } from '@/views/view-picker/states/viewPickerKanbanFieldMetadataIdComponentState';
import { viewPickerModeComponentState } from '@/views/view-picker/states/viewPickerModeComponentState';
import { viewPickerSelectedIconComponentState } from '@/views/view-picker/states/viewPickerSelectedIconComponentState';
import { viewPickerTypeComponentState } from '@/views/view-picker/states/viewPickerTypeComponentState';
import { useRecoilCallback } from 'recoil';
import { v4 } from 'uuid';

export const useCreateViewFromCurrentState = (viewBarInstanceId?: string) => {
  const { closeAndResetViewPicker } = useCloseAndResetViewPicker();

  const viewPickerInputNameCallbackState = useRecoilComponentCallbackStateV2(
    viewPickerInputNameComponentState,
    viewBarInstanceId,
  );

  const viewPickerSelectedIconCallbackState = useRecoilComponentCallbackStateV2(
    viewPickerSelectedIconComponentState,
    viewBarInstanceId,
  );

  const viewPickerTypeCallbackState = useRecoilComponentCallbackStateV2(
    viewPickerTypeComponentState,
    viewBarInstanceId,
  );

  const viewPickerKanbanFieldMetadataIdCallbackState =
    useRecoilComponentCallbackStateV2(
      viewPickerKanbanFieldMetadataIdComponentState,
      viewBarInstanceId,
    );

  const viewPickerIsPersistingCallbackState = useRecoilComponentCallbackStateV2(
    viewPickerIsPersistingComponentState,
    viewBarInstanceId,
  );

  const viewPickerIsDirtyCallbackState = useRecoilComponentCallbackStateV2(
    viewPickerIsDirtyComponentState,
    viewBarInstanceId,
  );

  const viewPickerModeCallbackState = useRecoilComponentCallbackStateV2(
    viewPickerModeComponentState,
    viewBarInstanceId,
  );

  const { createViewFromCurrentView } =
    useCreateViewFromCurrentView(viewBarInstanceId);
  const { changeView } = useChangeView(viewBarInstanceId);

  const createViewFromCurrentState = useRecoilCallback(
    ({ snapshot, set }) =>
      async () => {
        const name = getSnapshotValue(
          snapshot,
          viewPickerInputNameCallbackState,
        );
        const iconKey = getSnapshotValue(
          snapshot,
          viewPickerSelectedIconCallbackState,
        );
        const type = getSnapshotValue(snapshot, viewPickerTypeCallbackState);
        const kanbanFieldMetadataId = getSnapshotValue(
          snapshot,
          viewPickerKanbanFieldMetadataIdCallbackState,
        );

        const viewPickerMode = getSnapshotValue(
          snapshot,
          viewPickerModeCallbackState,
        );

        const shouldCopyFiltersAndSorts =
          viewPickerMode === 'create-from-current';

        const id = v4();

        set(viewPickerIsPersistingCallbackState, true);
        set(viewPickerIsDirtyCallbackState, false);

        await createViewFromCurrentView(
          {
            id,
            name,
            icon: iconKey,
            type,
            kanbanFieldMetadataId,
          },
          shouldCopyFiltersAndSorts,
        );

        closeAndResetViewPicker();
        changeView(id);
      },
    [
      closeAndResetViewPicker,
      createViewFromCurrentView,
      changeView,
      viewPickerInputNameCallbackState,
      viewPickerIsDirtyCallbackState,
      viewPickerIsPersistingCallbackState,
      viewPickerKanbanFieldMetadataIdCallbackState,
      viewPickerSelectedIconCallbackState,
      viewPickerTypeCallbackState,
      viewPickerModeCallbackState,
    ],
  );

  return { createViewFromCurrentState };
};
