import { useRecoilState } from 'recoil';

import { isRemoveSortingModalOpenState } from '@/object-record/record-table/states/isRemoveSortingModalOpenState';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useCombinedViewSorts } from '@/views/hooks/useCombinedViewSorts';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';

export const RecordIndexRemoveSortingModal = ({
  recordTableId,
}: {
  recordTableId: string;
}) => {
  const { currentViewWithCombinedFiltersAndSorts } =
    useGetCurrentView(recordTableId);

  const viewSorts = currentViewWithCombinedFiltersAndSorts?.viewSorts || [];
  const fieldMetadataIds = viewSorts.map(
    (viewSort) => viewSort.fieldMetadataId,
  );
  const isRemoveSortingModalOpen = useRecoilState(
    isRemoveSortingModalOpenState,
  );

  const { removeCombinedViewSort } = useCombinedViewSorts(recordTableId);

  const handleRemoveClick = () => {
    fieldMetadataIds.forEach((id) => {
      removeCombinedViewSort(id);
    });
  };

  return (
    <>
      <ConfirmationModal
        isOpen={isRemoveSortingModalOpen[0]}
        setIsOpen={isRemoveSortingModalOpen[1]}
        title={'Remove sorting?'}
        subtitle={<>This is required to enable manual row reordering.</>}
        onConfirmClick={() => handleRemoveClick()}
        deleteButtonText={'Remove Sorting'}
      />
    </>
  );
};
