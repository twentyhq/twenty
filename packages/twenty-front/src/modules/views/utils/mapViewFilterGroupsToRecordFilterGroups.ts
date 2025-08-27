import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type ViewFilterGroup } from '@/views/types/ViewFilterGroup';
import { mapViewFilterGroupLogicalOperatorToRecordFilterGroupLogicalOperator } from '@/views/utils/mapViewFilterGroupLogicalOperatorToRecordFilterGroupLogicalOperator';

export const mapViewFilterGroupsToRecordFilterGroups = (
  viewFilterGroups: ViewFilterGroup[],
): RecordFilterGroup[] => {
  return viewFilterGroups.map((viewFilterGroup) => {
    const recordFilterGroupLogicalOperator =
      mapViewFilterGroupLogicalOperatorToRecordFilterGroupLogicalOperator({
        viewFilterGroupLogicalOperator: viewFilterGroup.logicalOperator,
      });

    return {
      id: viewFilterGroup.id,
      parentRecordFilterGroupId: viewFilterGroup.parentViewFilterGroupId,
      logicalOperator: recordFilterGroupLogicalOperator,
      positionInRecordFilterGroup: viewFilterGroup.positionInViewFilterGroup,
    };
  });
};
