import { AdvancedFilterLogicalOperatorDropdown } from '@/object-record/advanced-filter/components/AdvancedFilterLogicalOperatorDropdown';
import { ViewFilterGroup } from '@/views/types/ViewFilterGroup';
import { capitalize } from '~/utils/string/capitalize';

interface AdvancedFilterLogicalOperatorCellProps {
  index: number;
  viewFilterGroup: ViewFilterGroup;
}

export const AdvancedFilterLogicalOperatorCell = (
  props: AdvancedFilterLogicalOperatorCellProps,
) => {
  return props.index === 0 ? (
    'Where'
  ) : props.index === 1 ? (
    <AdvancedFilterLogicalOperatorDropdown
      viewFilterGroup={props.viewFilterGroup}
    />
  ) : (
    capitalize(props.viewFilterGroup.logicalOperator.toLowerCase())
  );
};
