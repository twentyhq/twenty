import { RecordIndexGroupAggregateQueryEffect } from '@/object-record/record-index/components/RecordIndexGroupAggregateQueryEffect';
import { recordIndexGroupAggregateFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupAggregateFieldMetadataItemComponentState';
import { recordIndexGroupAggregateOperationComponentState } from '@/object-record/record-index/states/recordIndexGroupAggregateOperationComponentState';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';

import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { isDefined } from 'twenty-shared/utils';

export const RecordIndexGroupAggregatesDataLoader = () => {
  const recordIndexGroupFieldMetadataItem = useRecoilComponentValueV2(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const recordIndexGroupAggregateFieldMetadataItem = useRecoilComponentValueV2(
    recordIndexGroupAggregateFieldMetadataItemComponentState,
  );

  const recordIndexGroupAggregateOperation = useRecoilComponentValueV2(
    recordIndexGroupAggregateOperationComponentState,
  );

  if (
    !isDefined(recordIndexGroupFieldMetadataItem) ||
    !isDefined(recordIndexGroupAggregateOperation)
  ) {
    return null;
  }

  return (
    <RecordIndexGroupAggregateQueryEffect
      recordIndexGroupFieldMetadataItem={recordIndexGroupFieldMetadataItem}
      recordIndexGroupAggregateFieldMetadataItem={
        recordIndexGroupAggregateFieldMetadataItem
      }
      recordIndexGroupAggregateOperation={recordIndexGroupAggregateOperation}
    />
  );
};
