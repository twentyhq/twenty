import { useUpsertCombinedViewFilterGroup } from '@/object-record/advanced-filter/hooks/useUpsertCombinedViewFilterGroup';
import { Select } from '@/ui/input/components/Select';
import { ViewFilterGroup } from '@/views/types/ViewFilterGroup';
import { ViewFilterGroupLogicalOperator } from '@/views/types/ViewFilterGroupLogicalOperator';

interface AdvancedFilterLogicalOperatorDropdownProps {
  viewFilterGroup: ViewFilterGroup;
}

export const AdvancedFilterLogicalOperatorDropdown = (
  props: AdvancedFilterLogicalOperatorDropdownProps,
) => {
  const { upsertCombinedViewFilterGroup } = useUpsertCombinedViewFilterGroup();

  const handleChange = (value: ViewFilterGroupLogicalOperator) => {
    upsertCombinedViewFilterGroup({
      ...props.viewFilterGroup,
      logicalOperator: value,
    });
  };

  return (
    <Select
      disableBlur
      fullWidth
      dropdownId={`advanced-filter-logical-operator-${props.viewFilterGroup.id}`}
      value={props.viewFilterGroup.logicalOperator}
      onChange={handleChange}
      options={[
        {
          value: ViewFilterGroupLogicalOperator.AND,
          label: 'And',
        },
        {
          value: ViewFilterGroupLogicalOperator.OR,
          label: 'Or',
        },
        {
          value: ViewFilterGroupLogicalOperator.NOT,
          label: 'Not',
        },
      ]}
    />
  );
};
