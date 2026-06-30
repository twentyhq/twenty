import { AdvancedFilterDropdownRow } from '@/object-record/advanced-filter/components/AdvancedFilterDropdownRow';
import { AdvancedFilterLogicalOperatorCell } from '@/object-record/advanced-filter/components/AdvancedFilterLogicalOperatorCell';
import { AdvancedFilterRecordFilterGroupChildren } from '@/object-record/advanced-filter/components/AdvancedFilterRecordFilterGroupChildren';
import { AdvancedFilterRecordFilterGroupOptionsDropdown } from '@/object-record/advanced-filter/components/AdvancedFilterRecordFilterGroupOptionsDropdown';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';

export const AdvancedFilterRecordFilterGroupRow = ({
  parentRecordFilterGroup,
  recordFilterGroup,
  recordFilterGroupIndex,
}: {
  parentRecordFilterGroup: RecordFilterGroup;
  recordFilterGroup: RecordFilterGroup;
  recordFilterGroupIndex: number;
}) => {
  return (
    <AdvancedFilterDropdownRow>
      <AdvancedFilterLogicalOperatorCell
        index={recordFilterGroupIndex}
        recordFilterGroup={parentRecordFilterGroup}
      />
      <AdvancedFilterRecordFilterGroupChildren
        recordFilterGroupId={recordFilterGroup.id}
      />
      <AdvancedFilterRecordFilterGroupOptionsDropdown
        recordFilterGroupId={recordFilterGroup.id}
      />
    </AdvancedFilterDropdownRow>
  );
};
