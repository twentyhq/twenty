import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import { RecordIndexBoardColumnLoaderEffect } from '@/object-record/record-index/components/RecordIndexBoardColumnLoaderEffect';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataItemComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isDefined } from 'twenty-shared/utils';

type RecordIndexBoardDataLoaderProps = {
  objectNameSingular: string;
  recordBoardId: string;
};

export const RecordIndexBoardDataLoader = ({
  objectNameSingular,
  recordBoardId,
}: RecordIndexBoardDataLoaderProps) => {
  const recordGroupIds = useRecoilComponentValue(recordGroupIdsComponentState);

  const recordIndexGroupFieldMetadataItem = useRecoilComponentValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  if (!isDefined(recordIndexGroupFieldMetadataItem)) {
    return null;
  }

  return (
    <>
      {recordGroupIds.map((recordGroupId) => (
        <RecordIndexBoardColumnLoaderEffect
          objectNameSingular={objectNameSingular}
          kanbanFieldMetadataItem={recordIndexGroupFieldMetadataItem}
          recordBoardId={recordBoardId}
          columnId={recordGroupId}
          key={recordGroupId}
        />
      ))}
      {recordIndexGroupFieldMetadataItem.isNullable === true && (
        <RecordIndexBoardColumnLoaderEffect
          objectNameSingular={objectNameSingular}
          kanbanFieldMetadataItem={recordIndexGroupFieldMetadataItem}
          recordBoardId={recordBoardId}
          columnId="no-value"
        />
      )}
    </>
  );
};
