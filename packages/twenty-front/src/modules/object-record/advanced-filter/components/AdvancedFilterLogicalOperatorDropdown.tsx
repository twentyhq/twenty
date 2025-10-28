import { ADVANCED_FILTER_LOGICAL_OPERATOR_OPTIONS } from '@/object-record/advanced-filter/constants/AdvancedFilterLogicalOperatorOptions';
import { DEFAULT_ADVANCED_FILTER_DROPDOWN_OFFSET } from '@/object-record/advanced-filter/constants/DefaultAdvancedFilterDropdownOffset';
import { useUpsertRecordFilterGroup } from '@/object-record/record-filter-group/hooks/useUpsertRecordFilterGroup';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { type RecordFilterGroupLogicalOperator } from 'twenty-shared/types';

type AdvancedFilterLogicalOperatorDropdownProps = {
  recordFilterGroup: RecordFilterGroup;
};

export const AdvancedFilterLogicalOperatorDropdown = ({
  recordFilterGroup,
}: AdvancedFilterLogicalOperatorDropdownProps) => {
  const { upsertRecordFilterGroup } = useUpsertRecordFilterGroup();

  const handleChange = (value: RecordFilterGroupLogicalOperator) => {
    upsertRecordFilterGroup({
      id: recordFilterGroup.id,
      parentRecordFilterGroupId: recordFilterGroup.parentRecordFilterGroupId,
      positionInRecordFilterGroup:
        recordFilterGroup.positionInRecordFilterGroup,
      logicalOperator: value,
    });
  };

  return (
    <Select
      dropdownWidth={GenericDropdownContentWidth.Narrow}
      dropdownId={`advanced-filter-logical-operator-${recordFilterGroup.id}`}
      value={recordFilterGroup.logicalOperator}
      onChange={handleChange}
      options={ADVANCED_FILTER_LOGICAL_OPERATOR_OPTIONS}
      dropdownOffset={DEFAULT_ADVANCED_FILTER_DROPDOWN_OFFSET}
    />
  );
};
