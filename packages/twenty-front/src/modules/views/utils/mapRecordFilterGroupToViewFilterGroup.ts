import { RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { View } from '@/views/types/View';
import { ViewFilterGroup } from '@/views/types/ViewFilterGroup';
import { mapRecordFilterGroupLogicalOperatorToViewFilterGroupLogicalOperator } from '@/views/utils/mapRecordFilterGroupLogicalOperatorToViewFilterGroupLogicalOperator';

export const mapRecordFilterGroupToViewFilterGroup = ({
  recordFilterGroup,
  view,
}: {
  recordFilterGroup: RecordFilterGroup;
  view: Pick<View, 'id'>;
}): ViewFilterGroup => {
  return {
    __typename: 'ViewFilterGroup',
    id: recordFilterGroup.id,
    logicalOperator:
      mapRecordFilterGroupLogicalOperatorToViewFilterGroupLogicalOperator({
        recordFilterGroupLogicalOperator: recordFilterGroup.logicalOperator,
      }),
    viewId: view.id,
    parentViewFilterGroupId: recordFilterGroup.parentRecordFilterGroupId,
    positionInViewFilterGroup: recordFilterGroup.positionInRecordFilterGroup,
  };
};
