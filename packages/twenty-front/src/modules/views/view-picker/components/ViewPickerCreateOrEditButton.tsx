import { Button } from '@/ui/input/button/components/Button';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { ViewType } from '@/views/types/ViewType';
import { useGetAvailableFieldsForKanban } from '@/views/view-picker/hooks/useGetAvailableFieldsForKanban';
import { useViewPickerMode } from '@/views/view-picker/hooks/useViewPickerMode';
import { useViewPickerPersistView } from '@/views/view-picker/hooks/useViewPickerPersistView';
import { viewPickerIsPersistingComponentState } from '@/views/view-picker/states/viewPickerIsPersistingComponentState';
import { viewPickerKanbanFieldMetadataIdComponentState } from '@/views/view-picker/states/viewPickerKanbanFieldMetadataIdComponentState';
import { viewPickerTypeComponentState } from '@/views/view-picker/states/viewPickerTypeComponentState';

export const ViewPickerCreateOrEditButton = () => {
  const { availableFieldsForKanban, navigateToSelectSettings } =
    useGetAvailableFieldsForKanban();

  const { viewPickerMode } = useViewPickerMode();
  const viewPickerType = useRecoilComponentValueV2(
    viewPickerTypeComponentState,
  );
  const viewPickerIsPersisting = useRecoilComponentValueV2(
    viewPickerIsPersistingComponentState,
  );
  const viewPickerKanbanFieldMetadataId = useRecoilComponentValueV2(
    viewPickerKanbanFieldMetadataIdComponentState,
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
