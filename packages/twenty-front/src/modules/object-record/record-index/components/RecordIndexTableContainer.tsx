import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { RecordUpdateHookParams } from '@/object-record/field/contexts/FieldContext';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { RecordTableActionBar } from '@/object-record/record-table/action-bar/components/RecordTableActionBar';
import { RecordTableWithWrappers } from '@/object-record/record-table/components/RecordTableWithWrappers';
import { RecordTableContextMenu } from '@/object-record/record-table/context-menu/components/RecordTableContextMenu';

type RecordIndexTableContainerProps = {
  recordTableId: string;
  viewBarId: string;
  objectNameSingular: string;
  createRecord: () => Promise<void>;
};

export const RecordIndexTableContainer = ({
  recordTableId,
  viewBarId,
  objectNameSingular,
  createRecord,
}: RecordIndexTableContainerProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

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
        objectNamePlural={objectMetadataItem.namePlural}
        viewBarId={viewBarId}
        updateRecordMutation={updateEntity}
        createRecord={createRecord}
      />
      <RecordTableActionBar recordTableId={recordTableId} />
      <RecordTableContextMenu recordTableId={recordTableId} />
    </>
  );
};
