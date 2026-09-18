import { RecordIndexRemoveSortingModal } from '@/object-record/record-index/components/RecordIndexRemoveSortingModal';
import { RecordIndexTableContainerEffect } from '@/object-record/record-index/components/RecordIndexTableContainerEffect';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { getRecordIndexRemoveSortingModalId } from '@/object-record/record-index/utils/getRecordIndexRemoveSortingModalId';
import { RecordTableWithWrappers } from '@/object-record/record-table/components/RecordTableWithWrappers';
import { isDialogOpenedComponentState } from '@/ui/layout/dialog/states/isDialogOpenedComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

type RecordIndexTableContainerProps = {
  recordTableId: string;
};

export const RecordIndexTableContainer = ({
  recordTableId,
}: RecordIndexTableContainerProps) => {
  const { objectNameSingular, viewBarInstanceId, recordIndexId } =
    useRecordIndexContextOrThrow();

  const isDialogOpened = useAtomComponentStateValue(
    isDialogOpenedComponentState,
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
      {isDialogOpened && <RecordIndexRemoveSortingModal />}
    </>
  );
};
