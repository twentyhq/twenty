import { useRecoilValue } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { RecordBoard } from '@/object-record/record-board/components/RecordBoard';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { recordIndexKanbanFieldMetadataIdState } from '@/object-record/record-index/states/recordIndexKanbanFieldMetadataIdState';

type RecordIndexBoardContainerProps = {
  recordBoardId: string;
  viewBarId: string;
  objectNameSingular: string;
};

export const RecordIndexBoardContainer = ({
  recordBoardId,
  objectNameSingular,
}: RecordIndexBoardContainerProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const recordIndexKanbanFieldMetadataId = useRecoilValue(
    recordIndexKanbanFieldMetadataIdState,
  );

  const selectFieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.id === recordIndexKanbanFieldMetadataId,
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
        recordBoardId,
      }}
    >
      <RecordBoard />
    </RecordBoardContext.Provider>
  );
};
