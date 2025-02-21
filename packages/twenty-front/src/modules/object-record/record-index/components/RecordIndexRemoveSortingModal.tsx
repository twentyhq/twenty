import { useRecoilState } from 'recoil';

import { useRemoveRecordSort } from '@/object-record/record-sort/hooks/useRemoveRecordSort';
import { isRemoveSortingModalOpenState } from '@/object-record/record-table/states/isRemoveSortingModalOpenState';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useDeleteCombinedViewSorts } from '@/views/hooks/useDeleteCombinedViewSorts';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';

export const RecordIndexRemoveSortingModal = ({
  recordIndexId,
}: {
  recordIndexId: string;
}) => {
  const { currentViewWithCombinedFiltersAndSorts } =
    useGetCurrentView(recordIndexId);

  const viewSorts = currentViewWithCombinedFiltersAndSorts?.viewSorts || [];
  const fieldMetadataIds = viewSorts.map(
    (viewSort) => viewSort.fieldMetadataId,
  );
  const [isRemoveSortingModalOpen, setIsRemoveSortingModalOpen] =
    useRecoilState(isRemoveSortingModalOpenState);

  const { deleteCombinedViewSort } = useDeleteCombinedViewSorts(recordIndexId);

  const { removeRecordSort } = useRemoveRecordSort();

  const handleRemoveClick = () => {
    fieldMetadataIds.forEach((id) => {
      deleteCombinedViewSort(id);
      removeRecordSort(id);
    });
  };

  return (
    <>
      <ConfirmationModal
        isOpen={isRemoveSortingModalOpen}
        setIsOpen={setIsRemoveSortingModalOpen}
        title={'Remove sorting?'}
        subtitle={<>This is required to enable manual row reordering.</>}
        onConfirmClick={() => handleRemoveClick()}
        deleteButtonText={'Remove Sorting'}
      />
    </>
  );
};
