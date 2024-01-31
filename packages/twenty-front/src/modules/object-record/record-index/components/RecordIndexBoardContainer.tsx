import { useObjectMetadataItemOnly } from '@/object-metadata/hooks/useObjectMetadataItemOnly';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { RecordBoardActionBar } from '@/object-record/record-board/action-bar/components/RecordBoardActionBar';
import { RecordBoard } from '@/object-record/record-board/components/RecordBoard';
import { RecordBoardContextMenu } from '@/object-record/record-board/context-menu/components/RecordBoardContextMenu';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type RecordIndexBoardContainerProps = {
  recordBoardId: string;
  viewBarId: string;
  objectNameSingular: string;
  createRecord: () => Promise<void>;
};

export const RecordIndexBoardContainer = ({
  recordBoardId,
  objectNameSingular,
}: RecordIndexBoardContainerProps) => {
  const { objectMetadataItem } = useObjectMetadataItemOnly({
    objectNameSingular,
  });

  const selectFieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.type === FieldMetadataType.Select,
  );

  const { deleteOneRecord } = useDeleteOneRecord({ objectNameSingular });
  const { updateOneRecord } = useUpdateOneRecord({ objectNameSingular });
  const { createOneRecord } = useCreateOneRecord({ objectNameSingular });

  if (!selectFieldMetadataItem) {
    return;
  }

  return (
    <RecordBoardContext.Provider
      value={{
        objectMetadataItem,
        selectFieldMetadataItem,
        createOneRecord,
        updateOneRecord,
        deleteOneRecord,
      }}
    >
      <RecordBoard recordBoardId={recordBoardId} />
      <RecordBoardActionBar recordBoardId={recordBoardId} />
      <RecordBoardContextMenu recordBoardId={recordBoardId} />
    </RecordBoardContext.Provider>
  );
};
