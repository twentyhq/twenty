import { RecordIndexGroupAggregateQueryEffect } from '@/object-record/record-index/components/RecordIndexGroupAggregateQueryEffect';
import { recordIndexGroupAggregateFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupAggregateFieldMetadataItemComponentState';
import { recordIndexGroupAggregateOperationComponentState } from '@/object-record/record-index/states/recordIndexGroupAggregateOperationComponentState';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';

import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';

export const RecordIndexGroupAggregatesDataLoader = () => {
  const recordIndexGroupFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const recordIndexGroupAggregateFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupAggregateFieldMetadataItemComponentState,
  );

  const recordIndexGroupAggregateOperation = useAtomComponentStateValue(
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
