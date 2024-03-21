import { useCallback } from 'react';
import { useRecoilCallback, useRecoilValue, useSetRecoilState } from 'recoil';
import { v4 } from 'uuid';

import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { useHandleViews } from '@/views/hooks/useHandleViews';
import { useCloseAndResetViewPicker } from '@/views/view-picker/hooks/useCloseAndResetViewPicker';
import { useViewPickerStates } from '@/views/view-picker/hooks/useViewPickerStates';

export const useViewPickerPersistView = () => {
  const {
    viewPickerInputNameState,
    viewPickerSelectedIconState,
    viewPickerIsPersistingState,
    viewPickerReferenceViewIdState,
    viewPickerKanbanFieldMetadataIdState,
    viewPickerTypeState,
  } = useViewPickerStates();

  const viewPickerInputName = useRecoilValue(viewPickerInputNameState);
  const viewPickerSelectedIcon = useRecoilValue(viewPickerSelectedIconState);
  const setViewPickerIsPersisting = useSetRecoilState(
    viewPickerIsPersistingState,
  );

  const viewPickerReferenceViewId = useRecoilValue(
    viewPickerReferenceViewIdState,
  );

  const { createEmptyView, selectView, removeView, updateView } =
    useHandleViews();

  const { viewsOnCurrentObject } = useGetCurrentView();

  const { closeAndResetViewPicker } = useCloseAndResetViewPicker();

  const handleCreate = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const name = getSnapshotValue(snapshot, viewPickerInputNameState);
        const iconKey = getSnapshotValue(snapshot, viewPickerSelectedIconState);
        const type = getSnapshotValue(snapshot, viewPickerTypeState);
        const kanbanFieldMetadataId = getSnapshotValue(
          snapshot,
          viewPickerKanbanFieldMetadataIdState,
        );
        const id = v4();
        setViewPickerIsPersisting(true);
        await createEmptyView({
          id,
          name,
          icon: iconKey,
          type,
          kanbanFieldMetadataId,
        });
        selectView(id);
        closeAndResetViewPicker();
      },
    [
      closeAndResetViewPicker,
      createEmptyView,
      selectView,
      setViewPickerIsPersisting,
      viewPickerInputNameState,
      viewPickerKanbanFieldMetadataIdState,
      viewPickerSelectedIconState,
      viewPickerTypeState,
    ],
  );

  const handleDelete = useCallback(async () => {
    setViewPickerIsPersisting(true);
    selectView(
      viewsOnCurrentObject.filter(
        (view) => view.id !== viewPickerReferenceViewId,
      )[0].id,
    );
    await removeView(viewPickerReferenceViewId);
    closeAndResetViewPicker();
  }, [
    closeAndResetViewPicker,
    removeView,
    selectView,
    setViewPickerIsPersisting,
    viewPickerReferenceViewId,
    viewsOnCurrentObject,
  ]);

  const handleUpdate = useCallback(async () => {
    setViewPickerIsPersisting(true);
    await updateView({
      id: viewPickerReferenceViewId,
      name: viewPickerInputName,
      icon: viewPickerSelectedIcon,
    });
    selectView(viewPickerReferenceViewId);
    closeAndResetViewPicker();
  }, [
    setViewPickerIsPersisting,
    updateView,
    viewPickerReferenceViewId,
    viewPickerInputName,
    viewPickerSelectedIcon,
    selectView,
    closeAndResetViewPicker,
  ]);

  return { handleCreate, handleDelete, handleUpdate };
};
