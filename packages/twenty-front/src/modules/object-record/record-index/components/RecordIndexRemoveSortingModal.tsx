import { RECORD_INDEX_REMOVE_SORTING_MODAL_ID } from '@/object-record/record-index/constants/RecordIndexRemoveSortingModalId';
import { useRemoveRecordSort } from '@/object-record/record-sort/hooks/useRemoveRecordSort';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { useLingui } from '@lingui/react/macro';

export const RecordIndexRemoveSortingModal = () => {
  const { t } = useLingui();

  const currentRecordSorts = useRecoilComponentValueV2(
    currentRecordSortsComponentState,
  );

  const fieldMetadataIds = currentRecordSorts.map(
    (viewSort) => viewSort.fieldMetadataId,
  );

  const { removeRecordSort } = useRemoveRecordSort();

  const handleRemoveClick = () => {
    fieldMetadataIds.forEach((id) => {
      removeRecordSort(id);
    });
  };

  return (
    <ConfirmationModal
      modalId={RECORD_INDEX_REMOVE_SORTING_MODAL_ID}
      title={t`Remove sorting?`}
      subtitle={t`This is required to enable manual row reordering.`}
      onConfirmClick={handleRemoveClick}
      confirmButtonText={t`Remove Sorting`}
    />
  );
};
