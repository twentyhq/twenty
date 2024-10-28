import { useRecoilValue } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useRecordBoardStates } from '@/object-record/record-board/hooks/internal/useRecordBoardStates';
import { RecordIndexBoardColumnLoaderEffect } from '@/object-record/record-index/components/RecordIndexBoardColumnLoaderEffect';
import { recordIndexKanbanFieldMetadataIdState } from '@/object-record/record-index/states/recordIndexKanbanFieldMetadataIdState';

type RecordIndexBoardDataLoaderProps = {
  objectNameSingular: string;
  recordBoardId: string;
};

export const RecordIndexBoardDataLoader = ({
  objectNameSingular,
  recordBoardId,
}: RecordIndexBoardDataLoaderProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const recordIndexKanbanFieldMetadataId = useRecoilValue(
    recordIndexKanbanFieldMetadataIdState,
  );

  const recordIndexKanbanFieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.id === recordIndexKanbanFieldMetadataId,
  );

  const { columnIdsState } = useRecordBoardStates(recordBoardId);

  const columnIds = useRecoilValue(columnIdsState);

  return (
    <>
      {columnIds.map((columnId, index) => (
        <RecordIndexBoardColumnLoaderEffect
          objectNameSingular={objectNameSingular}
          boardFieldMetadataId={recordIndexKanbanFieldMetadataId}
          recordBoardId={recordBoardId}
          columnId={columnId}
          key={index}
        />
      ))}
      {recordIndexKanbanFieldMetadataItem?.isNullable && (
        <RecordIndexBoardColumnLoaderEffect
          objectNameSingular={objectNameSingular}
          boardFieldMetadataId={recordIndexKanbanFieldMetadataId}
          recordBoardId={recordBoardId}
          columnId={'no-value'}
        />
      )}
    </>
  );
};
