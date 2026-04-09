import { RecordIndexRemoveSortingModal } from '@/object-record/record-index/components/RecordIndexRemoveSortingModal';
import { RecordIndexTableContainerEffect } from '@/object-record/record-index/components/RecordIndexTableContainerEffect';
import { RECORD_INDEX_REMOVE_SORTING_MODAL_ID } from '@/object-record/record-index/constants/RecordIndexRemoveSortingModalId';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordTableWithWrappers } from '@/object-record/record-table/components/RecordTableWithWrappers';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

type RecordIndexTableContainerProps = {
  recordTableId: string;
};

export const RecordIndexTableContainer = ({
  recordTableId,
}: RecordIndexTableContainerProps) => {
  const { objectNameSingular, viewBarInstanceId } =
    useRecordIndexContextOrThrow();

  const isModalOpened = useAtomComponentStateValue(
    isModalOpenedComponentState,
    RECORD_INDEX_REMOVE_SORTING_MODAL_ID,
  );

  return (
    <>
      <RecordIndexTableContainerEffect />
      <RecordTableWithWrappers
        recordTableId={recordTableId}
        objectNameSingular={objectNameSingular}
        viewBarId={viewBarInstanceId}
      />
      {isModalOpened && <RecordIndexRemoveSortingModal />}
    </>
  );
};
