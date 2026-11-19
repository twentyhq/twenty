import { useConditionalAvailabilityEditorContext } from '@/conditional-availability/contexts/ConditionalAvailabilityEditorContext';
import { type ConditionalAvailabilityOperator } from '@/conditional-availability/types/ConditionalAvailabilityOperator';
import { type ConditionalAvailabilityRow } from '@/conditional-availability/types/ConditionalAvailabilityRow';
import { getConditionalAvailabilityOperatorLabel } from '@/conditional-availability/utils/getConditionalAvailabilityOperatorLabel';
import { getConditionalAvailabilityRowOperators } from '@/conditional-availability/utils/getConditionalAvailabilityRowOperators';
import { DEFAULT_ADVANCED_FILTER_DROPDOWN_SIDE_OFFSET } from '@/object-record/advanced-filter/constants/DefaultAdvancedFilterDropdownSideOffset';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';

type ConditionalAvailabilityOperatorSelectProps = {
  row: ConditionalAvailabilityRow;
};

export const ConditionalAvailabilityOperatorSelect = ({
  row,
}: ConditionalAvailabilityOperatorSelectProps) => {
  const { itemKey, isReadOnly, changeRowOperator } =
    useConditionalAvailabilityEditorContext();

  const options = getConditionalAvailabilityRowOperators({
    rowSubject: row,
  }).map((operator) => ({
    value: operator,
    label: getConditionalAvailabilityOperatorLabel({ operator }),
  }));

  const handleOperatorChange = (operator: ConditionalAvailabilityOperator) => {
    if (operator !== row.operator) {
      changeRowOperator({ rowId: row.id, operator });
    }
  };

  return (
    <Select
      dropdownId={`conditional-availability-operator-${itemKey}-${row.id}`}
      options={options}
      value={row.operator}
      onChange={handleOperatorChange}
      disabled={isReadOnly}
      dropdownSideOffset={DEFAULT_ADVANCED_FILTER_DROPDOWN_SIDE_OFFSET}
      dropdownWidth={GenericDropdownContentWidth.Large}
      fullWidth
    />
  );
};
