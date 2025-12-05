import { RecordIndexGroupAggregateQueryEffect } from '@/object-record/record-index/components/RecordIndexGroupAggregateQueryEffect';
import { recordIndexGroupAggregateFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupAggregateFieldMetadataItemComponentState';
import { recordIndexGroupAggregateOperationComponentState } from '@/object-record/record-index/states/recordIndexGroupAggregateOperationComponentState';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';

import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isDefined } from 'twenty-shared/utils';

export const RecordIndexGroupAggregatesDataLoader = () => {
  const recordIndexGroupFieldMetadataItem = useRecoilComponentValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const recordIndexGroupAggregateFieldMetadataItem = useRecoilComponentValue(
    recordIndexGroupAggregateFieldMetadataItemComponentState,
  );

  const recordIndexGroupAggregateOperation = useRecoilComponentValue(
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
