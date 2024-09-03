import { useRecoilCallback } from 'recoil';
import { v4 } from 'uuid';

import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilInstanceCallbackState } from '@/ui/utilities/state/instance/hooks/useRecoilInstanceCallbackState';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { useHandleViews } from '@/views/hooks/useHandleViews';
import { useCloseAndResetViewPicker } from '@/views/view-picker/hooks/useCloseAndResetViewPicker';
import { viewPickerInputNameInstanceState } from '@/views/view-picker/states/viewPickerInputNameInstanceState';
import { viewPickerIsDirtyInstanceState } from '@/views/view-picker/states/viewPickerIsDirtyInstanceState';
import { viewPickerIsPersistingInstanceState } from '@/views/view-picker/states/viewPickerIsPersistingInstanceState';
import { viewPickerKanbanFieldMetadataIdInstanceState } from '@/views/view-picker/states/viewPickerKanbanFieldMetadataIdInstanceState';
import { viewPickerReferenceViewIdInstanceState } from '@/views/view-picker/states/viewPickerReferenceViewIdInstanceState';
import { viewPickerSelectedIconInstanceState } from '@/views/view-picker/states/viewPickerSelectedIconInstanceState';
import { viewPickerTypeInstanceState } from '@/views/view-picker/states/viewPickerTypeInstanceState';

export const useViewPickerPersistView = () => {
  const { createView, selectView, removeView, updateView } = useHandleViews();

  const { viewsOnCurrentObject } = useGetCurrentView();

  const { closeAndResetViewPicker } = useCloseAndResetViewPicker();

  const viewPickerInputNameCallbackState = useRecoilInstanceCallbackState(
    viewPickerInputNameInstanceState,
  );

  const viewPickerSelectedIconCallbackState = useRecoilInstanceCallbackState(
    viewPickerSelectedIconInstanceState,
  );

  const viewPickerTypeCallbackState = useRecoilInstanceCallbackState(
    viewPickerTypeInstanceState,
  );

  const viewPickerKanbanFieldMetadataIdCallbackState =
    useRecoilInstanceCallbackState(
      viewPickerKanbanFieldMetadataIdInstanceState,
    );

  const viewPickerIsPersistingCallbackState = useRecoilInstanceCallbackState(
    viewPickerIsPersistingInstanceState,
  );

  const viewPickerIsDirtyCallbackState = useRecoilInstanceCallbackState(
    viewPickerIsDirtyInstanceState,
  );

  const viewPickerReferenceViewIdCallbackState = useRecoilInstanceCallbackState(
    viewPickerReferenceViewIdInstanceState,
  );

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
