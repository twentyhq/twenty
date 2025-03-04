import { useRecoilState } from 'recoil';

import { useRemoveRecordSort } from '@/object-record/record-sort/hooks/useRemoveRecordSort';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { isRemoveSortingModalOpenState } from '@/object-record/record-table/states/isRemoveSortingModalOpenState';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const RecordIndexRemoveSortingModal = () => {
  const currentRecordSorts = useRecoilComponentValueV2(
    currentRecordSortsComponentState,
  );

  const fieldMetadataIds = currentRecordSorts.map(
    (viewSort) => viewSort.fieldMetadataId,
  );
  const [isRemoveSortingModalOpen, setIsRemoveSortingModalOpen] =
    useRecoilState(isRemoveSortingModalOpenState);

  const { removeRecordSort } = useRemoveRecordSort();

  const handleRemoveClick = () => {
    fieldMetadataIds.forEach((id) => {
      removeRecordSort(id);
    });
  };

  return (
    <>
      <ConfirmationModal
        isOpen={isRemoveSortingModalOpen}
        setIsOpen={setIsRemoveSortingModalOpen}
        title={'Remove sorting?'}
        subtitle={'This is required to enable manual row reordering.'}
        onConfirmClick={handleRemoveClick}
        confirmButtonText={'Remove Sorting'}
      />
    </>
  );
};
