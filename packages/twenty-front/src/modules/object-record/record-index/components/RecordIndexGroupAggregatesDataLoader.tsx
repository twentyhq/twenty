import { RecordIndexGroupAggregateQueryEffect } from '@/object-record/record-index/components/RecordIndexGroupAggregateQueryEffect';
import { recordIndexGroupAggregateFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupAggregateFieldMetadataItemComponentState';
import { recordIndexGroupAggregateOperationComponentState } from '@/object-record/record-index/states/recordIndexGroupAggregateOperationComponentState';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';

import { useAtomComponentValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentValue';
import { isDefined } from 'twenty-shared/utils';

export const RecordIndexGroupAggregatesDataLoader = () => {
  const recordIndexGroupFieldMetadataItem = useAtomComponentValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const recordIndexGroupAggregateFieldMetadataItem = useAtomComponentValue(
    recordIndexGroupAggregateFieldMetadataItemComponentState,
  );

  const recordIndexGroupAggregateOperation = useAtomComponentValue(
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
