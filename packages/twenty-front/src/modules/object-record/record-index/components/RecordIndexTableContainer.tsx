import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { type RecordUpdateHookParams } from '@/object-record/record-field/ui/contexts/FieldContext';
import { RecordIndexRemoveSortingModal } from '@/object-record/record-index/components/RecordIndexRemoveSortingModal';
import { RECORD_INDEX_REMOVE_SORTING_MODAL_ID } from '@/object-record/record-index/constants/RecordIndexRemoveSortingModalId';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordTableWithWrappers } from '@/object-record/record-table/components/RecordTableWithWrappers';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

type RecordIndexTableContainerProps = {
  recordTableId: string;
};

export const RecordIndexTableContainer = ({
  recordTableId,
}: RecordIndexTableContainerProps) => {
  const { objectNameSingular, viewBarInstanceId } =
    useRecordIndexContextOrThrow();

  const isRecordIndexRemoveSortingModalOpened = useRecoilComponentValue(
    isModalOpenedComponentState,
    RECORD_INDEX_REMOVE_SORTING_MODAL_ID,
  );

  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular,
  });

  const updateEntity = ({ variables }: RecordUpdateHookParams) => {
    updateOneRecord?.({
      idToUpdate: variables.where.id as string,
      updateOneRecordInput: variables.updateOneRecordInput,
    });
  };

  return (
    <>
      <RecordTableWithWrappers
        recordTableId={recordTableId}
        objectNameSingular={objectNameSingular}
        viewBarId={viewBarInstanceId}
        updateRecordMutation={updateEntity}
      />
      {isRecordIndexRemoveSortingModalOpened && (
        <RecordIndexRemoveSortingModal />
      )}
    </>
  );
};
