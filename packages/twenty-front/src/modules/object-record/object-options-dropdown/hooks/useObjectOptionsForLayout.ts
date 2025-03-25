import { recordIndexViewTypeState } from '@/object-record/record-index/states/recordIndexViewTypeState';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useUpdateCurrentView } from '@/views/hooks/useUpdateCurrentView';
import { ViewType } from '@/views/types/ViewType';
import { useGetAvailableFieldsForKanban } from '@/views/view-picker/hooks/useGetAvailableFieldsForKanban';
import { viewPickerKanbanFieldMetadataIdComponentState } from '@/views/view-picker/states/viewPickerKanbanFieldMetadataIdComponentState';
import { useCallback } from 'react';
import { useRecoilState } from 'recoil';

export const useObjectOptionsForLayout = () => {
  const { updateCurrentView } = useUpdateCurrentView();
  const [, setRecordIndexViewType] = useRecoilState(recordIndexViewTypeState);
  const { availableFieldsForKanban } = useGetAvailableFieldsForKanban();

  const [, setViewPickerKanbanFieldMetadataId] = useRecoilComponentStateV2(
    viewPickerKanbanFieldMetadataIdComponentState,
  );

  const setAndPersistViewType = useCallback(
    (viewType: ViewType) => {
      if (viewType === ViewType.Kanban) {
        const randomFieldForKanban = availableFieldsForKanban[0];
        updateCurrentView({
          kanbanFieldMetadataId: randomFieldForKanban.id,
        });

        setViewPickerKanbanFieldMetadataId(randomFieldForKanban.id);
      }
      setRecordIndexViewType(viewType);
      updateCurrentView({
        type: viewType,
      });
    },
    [
      availableFieldsForKanban,
      updateCurrentView,
      setRecordIndexViewType,
      setViewPickerKanbanFieldMetadataId,
    ],
  );

  return {
    setAndPersistViewType,
  };
};
