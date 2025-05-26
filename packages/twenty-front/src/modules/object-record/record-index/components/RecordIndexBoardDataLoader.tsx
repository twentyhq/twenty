import { useRecoilValue } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import { RecordIndexBoardColumnLoaderEffect } from '@/object-record/record-index/components/RecordIndexBoardColumnLoaderEffect';
import { recordIndexKanbanFieldMetadataIdState } from '@/object-record/record-index/states/recordIndexKanbanFieldMetadataIdState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isDefined } from 'twenty-shared/utils';

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

  const recordGroupIds = useRecoilComponentValueV2(
    recordGroupIdsComponentState,
  );

  const recordIndexKanbanFieldMetadataId = useRecoilValue(
    recordIndexKanbanFieldMetadataIdState,
  );

  const recordIndexKanbanFieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.id === recordIndexKanbanFieldMetadataId,
  );

  if (!isDefined(recordIndexKanbanFieldMetadataItem)) {
    return null;
  }

  return (
    <>
      {recordGroupIds.map((recordGroupId) => (
        <RecordIndexBoardColumnLoaderEffect
          objectNameSingular={objectNameSingular}
          kanbanFieldMetadataItem={recordIndexKanbanFieldMetadataItem}
          recordBoardId={recordBoardId}
          columnId={recordGroupId}
          key={recordGroupId}
        />
      ))}
      {recordIndexKanbanFieldMetadataItem.isNullable === true && (
        <RecordIndexBoardColumnLoaderEffect
          objectNameSingular={objectNameSingular}
          kanbanFieldMetadataItem={recordIndexKanbanFieldMetadataItem}
          recordBoardId={recordBoardId}
          columnId={'no-value'}
        />
      )}
    </>
  );
};
