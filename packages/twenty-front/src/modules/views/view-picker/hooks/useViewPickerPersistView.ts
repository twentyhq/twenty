import { useRecoilCallback } from 'recoil';
import { v4 } from 'uuid';

import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { useHandleViews } from '@/views/hooks/useHandleViews';
import { useCloseAndResetViewPicker } from '@/views/view-picker/hooks/useCloseAndResetViewPicker';
import { viewPickerInputNameComponentState } from '@/views/view-picker/states/viewPickerInputNameComponentState';
import { viewPickerIsDirtyComponentState } from '@/views/view-picker/states/viewPickerIsDirtyComponentState';
import { viewPickerIsPersistingComponentState } from '@/views/view-picker/states/viewPickerIsPersistingComponentState';
import { viewPickerKanbanFieldMetadataIdComponentState } from '@/views/view-picker/states/viewPickerKanbanFieldMetadataIdComponentState';
import { viewPickerReferenceViewIdComponentState } from '@/views/view-picker/states/viewPickerReferenceViewIdComponentState';
import { viewPickerSelectedIconComponentState } from '@/views/view-picker/states/viewPickerSelectedIconComponentState';
import { viewPickerTypeComponentState } from '@/views/view-picker/states/viewPickerTypeComponentState';

export const useViewPickerPersistView = () => {
  const { createView, selectView, removeView, updateView } = useHandleViews();

  const { viewsOnCurrentObject } = useGetCurrentView();

  const { closeAndResetViewPicker } = useCloseAndResetViewPicker();

  const viewPickerInputNameCallbackState = useRecoilComponentCallbackStateV2(
    viewPickerInputNameComponentState,
  );

  const viewPickerSelectedIconCallbackState = useRecoilComponentCallbackStateV2(
    viewPickerSelectedIconComponentState,
  );

  const viewPickerTypeCallbackState = useRecoilComponentCallbackStateV2(
    viewPickerTypeComponentState,
  );

  const viewPickerKanbanFieldMetadataIdCallbackState =
    useRecoilComponentCallbackStateV2(
      viewPickerKanbanFieldMetadataIdComponentState,
    );

  const viewPickerIsPersistingCallbackState = useRecoilComponentCallbackStateV2(
    viewPickerIsPersistingComponentState,
  );

  const viewPickerIsDirtyCallbackState = useRecoilComponentCallbackStateV2(
    viewPickerIsDirtyComponentState,
  );

  const viewPickerReferenceViewIdCallbackState =
    useRecoilComponentCallbackStateV2(viewPickerReferenceViewIdComponentState);

  const handleCreate = useRecoilCallback(
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
        const id = v4();
        set(viewPickerIsPersistingCallbackState, true);
        set(viewPickerIsDirtyCallbackState, false);
        await createView({
          id,
          name,
          icon: iconKey,
          type,
          kanbanFieldMetadataId,
        });
        closeAndResetViewPicker();
        selectView(id);
      },
    [
      closeAndResetViewPicker,
      createView,
      selectView,
      viewPickerInputNameCallbackState,
      viewPickerIsDirtyCallbackState,
      viewPickerIsPersistingCallbackState,
      viewPickerKanbanFieldMetadataIdCallbackState,
      viewPickerSelectedIconCallbackState,
      viewPickerTypeCallbackState,
    ],
  );

  const handleDelete = useRecoilCallback(
    ({ set, snapshot }) =>
      async () => {
        set(viewPickerIsPersistingCallbackState, true);
        closeAndResetViewPicker();
        set(viewPickerIsDirtyCallbackState, false);
        const viewPickerReferenceViewId = getSnapshotValue(
          snapshot,
          viewPickerReferenceViewIdCallbackState,
        );

        selectView(
          viewsOnCurrentObject.filter(
            (view) => view.id !== viewPickerReferenceViewId,
          )[0].id,
        );
        await removeView(viewPickerReferenceViewId);
      },
    [
      closeAndResetViewPicker,
      removeView,
      selectView,
      viewPickerIsDirtyCallbackState,
      viewPickerIsPersistingCallbackState,
      viewPickerReferenceViewIdCallbackState,
      viewsOnCurrentObject,
    ],
  );

  const handleUpdate = useRecoilCallback(
    ({ set, snapshot }) =>
      async () => {
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

        await updateView({
          id: viewPickerReferenceViewId,
          name: viewPickerInputName,
          icon: viewPickerSelectedIcon,
        });
        selectView(viewPickerReferenceViewId);
      },
    [
      viewPickerIsPersistingCallbackState,
      viewPickerIsDirtyCallbackState,
      closeAndResetViewPicker,
      viewPickerReferenceViewIdCallbackState,
      viewPickerInputNameCallbackState,
      viewPickerSelectedIconCallbackState,
      updateView,
      selectView,
    ],
  );

  return { handleCreate, handleDelete, handleUpdate };
};
