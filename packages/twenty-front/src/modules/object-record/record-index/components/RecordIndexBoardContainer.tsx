import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { RecordBoard } from '@/object-record/record-board/components/RecordBoard';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';

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
  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });

  const { deleteOneRecord } = useDeleteOneRecord({ objectNameSingular });
  const { updateOneRecord } = useUpdateOneRecord({ objectNameSingular });
  const { createOneRecord } = useCreateOneRecord({ objectNameSingular });

  return (
    <RecordBoardContext.Provider
      value={{
        objectMetadataItem,
        createOneRecord,
        updateOneRecord,
        deleteOneRecord,
      }}
    >
      <RecordBoard recordBoardId={recordBoardId} />
    </RecordBoardContext.Provider>
  );
};
