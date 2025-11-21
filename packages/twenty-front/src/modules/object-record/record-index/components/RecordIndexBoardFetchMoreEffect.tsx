import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import { RecordIndexBoardColumnFetchMoreEffect } from '@/object-record/record-index/components/RecordIndexBoardColumnFetchMoreEffect';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataItemComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isDefined } from 'twenty-shared/utils';

export const RecordIndexBoardFetchMoreDataLoader = () => {
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
        <RecordIndexBoardColumnFetchMoreEffect
          columnId={recordGroupId}
          key={recordGroupId}
        />
      ))}
      {recordIndexGroupFieldMetadataItem.isNullable === true && (
        <RecordIndexBoardColumnFetchMoreEffect columnId={'no-value'} />
      )}
    </>
  );
};
