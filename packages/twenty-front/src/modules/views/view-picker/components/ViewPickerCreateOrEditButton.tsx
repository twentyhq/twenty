import { Button } from '@/ui/input/button/components/Button';
import { useRecoilInstanceValue } from '@/ui/utilities/state/instance/hooks/useRecoilInstanceValue';
import { ViewType } from '@/views/types/ViewType';
import { useGetAvailableFieldsForKanban } from '@/views/view-picker/hooks/useGetAvailableFieldsForKanban';
import { useViewPickerMode } from '@/views/view-picker/hooks/useViewPickerMode';
import { useViewPickerPersistView } from '@/views/view-picker/hooks/useViewPickerPersistView';
import { viewPickerIsPersistingInstanceState } from '@/views/view-picker/states/viewPickerIsPersistingInstanceState';
import { viewPickerKanbanFieldMetadataIdInstanceState } from '@/views/view-picker/states/viewPickerKanbanFieldMetadataIdInstanceState';
import { viewPickerTypeInstanceState } from '@/views/view-picker/states/viewPickerTypeInstanceState';

export const ViewPickerCreateOrEditButton = () => {
  const { availableFieldsForKanban, navigateToSelectSettings } =
    useGetAvailableFieldsForKanban();

  const { viewPickerMode } = useViewPickerMode();
  const viewPickerType = useRecoilInstanceValue(viewPickerTypeInstanceState);
  const viewPickerIsPersisting = useRecoilInstanceValue(
    viewPickerIsPersistingInstanceState,
  );
  const viewPickerKanbanFieldMetadataId = useRecoilInstanceValue(
    viewPickerKanbanFieldMetadataIdInstanceState,
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
