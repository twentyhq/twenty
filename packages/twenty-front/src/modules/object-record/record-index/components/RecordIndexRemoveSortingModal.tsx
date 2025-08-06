import { RECORD_INDEX_REMOVE_SORTING_MODAL_ID } from '@/object-record/record-index/constants/RecordIndexRemoveSortingModalId';
import { useRemoveRecordSort } from '@/object-record/record-sort/hooks/useRemoveRecordSort';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

export const RecordIndexRemoveSortingModal = () => {
  const currentRecordSorts = useRecoilComponentValue(
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
      title={'Remove sorting?'}
      subtitle={'This is required to enable manual row reordering.'}
      onConfirmClick={handleRemoveClick}
      confirmButtonText={'Remove Sorting'}
    />
  );
};
