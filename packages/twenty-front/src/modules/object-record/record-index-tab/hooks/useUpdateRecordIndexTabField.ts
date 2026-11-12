import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { selectedRecordIndexTabIdComponentState } from '@/object-record/record-index-tab/states/selectedRecordIndexTabIdComponentState';
import { recordIndexTabFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexTabFieldMetadataItemComponentState';
import { useResetRecordSelection } from '@/object-record/record-selection/hooks/useResetRecordSelection';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useUpdateCurrentView } from '@/views/hooks/useUpdateCurrentView';

export const useUpdateRecordIndexTabField = (recordIndexId: string) => {
  const setRecordIndexTabFieldMetadataItem = useSetAtomComponentState(
    recordIndexTabFieldMetadataItemComponentState,
  );

  const setSelectedRecordIndexTabId = useSetAtomComponentState(
    selectedRecordIndexTabIdComponentState,
  );

  const { updateCurrentView } = useUpdateCurrentView();

  const { resetRecordSelection } = useResetRecordSelection(recordIndexId);

  const updateRecordIndexTabField = async (
    fieldMetadataItem: FieldMetadataItem | undefined,
  ) => {
    resetRecordSelection();
    setSelectedRecordIndexTabId(null);
    setRecordIndexTabFieldMetadataItem(fieldMetadataItem);

    await updateCurrentView({
      tabFieldMetadataId: fieldMetadataItem?.id ?? null,
    });
  };

  return { updateRecordIndexTabField };
};
