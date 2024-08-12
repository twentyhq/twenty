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

  const possibleKanbanSelectFieldValues =
    recordIndexKanbanFieldMetadataItem?.options ?? [];

  const { columnIdsState } = useRecordBoardStates(recordBoardId);

  // TODO: we should make sure there's no way to have a mismatch between columnIds and possibleKanbanSelectFieldValues order
  const columnIds = useRecoilValue(columnIdsState);

  return (
    <>
      {possibleKanbanSelectFieldValues.map((option, index) => (
        <RecordIndexBoardColumnLoaderEffect
          objectNameSingular={objectNameSingular}
          boardFieldMetadataId={recordIndexKanbanFieldMetadataId}
          boardFieldSelectValue={option.value}
          recordBoardId={recordBoardId}
          columnId={columnIds[index]}
          key={index}
        />
      ))}
      {recordIndexKanbanFieldMetadataItem?.isNullable && (
        <RecordIndexBoardColumnLoaderEffect
          objectNameSingular={objectNameSingular}
          boardFieldMetadataId={recordIndexKanbanFieldMetadataId}
          boardFieldSelectValue={null}
          recordBoardId={recordBoardId}
          columnId={'no-value'}
        />
      )}
    </>
  );
};
