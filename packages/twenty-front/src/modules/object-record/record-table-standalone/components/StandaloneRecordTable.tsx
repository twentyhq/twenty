import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { type RecordUpdateHookParams } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { StandaloneRecordTableSetReadOnlyColumnHeadersEffect } from '@/object-record/record-table-standalone/components/StandaloneRecordTableSetReadOnlyColumnHeadersEffect';
import { RecordTableWithWrappers } from '@/object-record/record-table/components/RecordTableWithWrappers';

export const StandaloneRecordTable = () => {
  const { objectNameSingular, recordIndexId, viewBarInstanceId } =
    useRecordIndexContextOrThrow();

  const { updateOneRecord } = useUpdateOneRecord();

  const updateEntity = ({ variables }: RecordUpdateHookParams) => {
    updateOneRecord({
      objectNameSingular,
      idToUpdate: variables.where.id as string,
      updateOneRecordInput: variables.updateOneRecordInput,
    });
  };

  return (
    <>
      <StandaloneRecordTableSetReadOnlyColumnHeadersEffect
        recordTableId={recordIndexId}
      />
      <RecordTableWithWrappers
        recordTableId={recordIndexId}
        objectNameSingular={objectNameSingular}
        viewBarId={viewBarInstanceId}
        updateRecordMutation={updateEntity}
      />
    </>
  );
};
