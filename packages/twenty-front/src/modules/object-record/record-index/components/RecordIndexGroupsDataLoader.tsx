import { RecordIndexGroupsQueryEffect } from '@/object-record/record-index/components/RecordIndexGroupsQueryEffect';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataItemComponentState';

import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isDefined } from 'twenty-shared/utils';

export const RecordIndexGroupAggregatesDataLoader = () => {
  const recordIndexGroupFieldMetadataItem = useRecoilComponentValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  if (!isDefined(recordIndexGroupFieldMetadataItem)) {
    return null;
  }

  return <RecordIndexGroupsQueryEffect />;
};
