import { useRecoilValue, useSetRecoilState } from 'recoil';

import { removeSortingModalOpenState } from '@/object-record/record-table/states/removeSortingModalOpenState';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useCombinedViewSorts } from '@/views/hooks/useCombinedViewSorts';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';

export const RemoveSortingModal = ({
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
  const removeSortingModalOpen = useRecoilValue(removeSortingModalOpenState);
  const setIsRemoveSortingModalOpen = useSetRecoilState(
    removeSortingModalOpenState,
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
        isOpen={removeSortingModalOpen}
        setIsOpen={setIsRemoveSortingModalOpen}
        title={'Sorting removal'}
        subtitle={
          <>
            Would you like to remove all sorting?
            <br />
            <br />
            This action will enable manual row reordering.
          </>
        }
        onConfirmClick={() => handleRemoveClick()}
        deleteButtonText={'Remove Sorting'}
      />
    </>
  );
};
