import { RecordIndexRemoveSortingModal } from '@/object-record/record-index/components/RecordIndexRemoveSortingModal';
import { RecordIndexTableContainerEffect } from '@/object-record/record-index/components/RecordIndexTableContainerEffect';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { getRecordIndexRemoveSortingModalId } from '@/object-record/record-index/utils/getRecordIndexRemoveSortingModalId';
import { RecordTableWithWrappers } from '@/object-record/record-table/components/RecordTableWithWrappers';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

type RecordIndexTableContainerProps = {
  recordTableId: string;
};

export const RecordIndexTableContainer = ({
  recordTableId,
}: RecordIndexTableContainerProps) => {
  const { objectNameSingular, viewBarInstanceId, recordIndexId } =
    useRecordIndexContextOrThrow();

  const isModalOpened = useAtomComponentStateValue(
    isModalOpenedComponentState,
    getRecordIndexRemoveSortingModalId(recordIndexId),
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
