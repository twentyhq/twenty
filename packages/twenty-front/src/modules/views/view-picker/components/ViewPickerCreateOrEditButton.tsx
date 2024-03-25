import { useRecoilValue } from 'recoil';

import { Button } from '@/ui/input/button/components/Button';
import { ViewType } from '@/views/types/ViewType';
import { useGetAvailableFieldsForKanban } from '@/views/view-picker/hooks/useGetAvailableFieldsForKanban';
import { useViewPickerMode } from '@/views/view-picker/hooks/useViewPickerMode';
import { useViewPickerPersistView } from '@/views/view-picker/hooks/useViewPickerPersistView';
import { useViewPickerStates } from '@/views/view-picker/hooks/useViewPickerStates';

export const ViewPickerCreateOrEditButton = () => {
  const { availableFieldsForKanban, navigateToSelectSettings } =
    useGetAvailableFieldsForKanban();

  const {
    viewPickerIsPersistingState,
    viewPickerKanbanFieldMetadataIdState,
    viewPickerTypeState,
  } = useViewPickerStates();

  const { viewPickerMode } = useViewPickerMode();
  const viewPickerType = useRecoilValue(viewPickerTypeState);
  const viewPickerIsPersisting = useRecoilValue(viewPickerIsPersistingState);
  const viewPickerKanbanFieldMetadataId = useRecoilValue(
    viewPickerKanbanFieldMetadataIdState,
  );

  const { handleCreate, handleDelete } = useViewPickerPersistView();

  if (viewPickerMode === 'edit') {
    return (
      <Button
        title="Delete"
        onClick={handleDelete}
        accent="danger"
        fullWidth
        size="small"
        justify="center"
        focus={false}
        variant="secondary"
        disabled={viewPickerIsPersisting}
      />
    );
  }

  if (
    viewPickerType === ViewType.Kanban &&
    availableFieldsForKanban.length === 0
  ) {
    return (
      <Button
        title="Go to Settings"
        onClick={navigateToSelectSettings}
        size="small"
        accent="blue"
        fullWidth
        justify="center"
      />
    );
  }

  if (
    viewPickerType === ViewType.Table ||
    viewPickerKanbanFieldMetadataId !== ''
  ) {
    return (
      <Button
        title="Create"
        onClick={handleCreate}
        accent="blue"
        fullWidth
        size="small"
        justify="center"
        disabled={
          viewPickerIsPersisting ||
          (viewPickerType === ViewType.Kanban &&
            viewPickerKanbanFieldMetadataId === '')
        }
      />
    );
  }
};
