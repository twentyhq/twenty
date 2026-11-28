import { useConditionalAvailabilityFilterBuilderContextOrThrow } from '@/conditional-availability/filter-builder/contexts/ConditionalAvailabilityFilterBuilderContext';
import { useUpdateConditionalAvailabilityFilterSettings } from '@/conditional-availability/filter-builder/hooks/useUpdateConditionalAvailabilityFilterSettings';
import { type ConditionalAvailabilityFilter } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilter';
import { type ConditionalAvailabilityFilterOperator } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterOperator';
import { getConditionalAvailabilityFilterOperatorLabel } from '@/conditional-availability/filter-builder/utils/getConditionalAvailabilityFilterOperatorLabel';
import { getConditionalAvailabilityFilterVariableOperators } from '@/conditional-availability/filter-builder/utils/getConditionalAvailabilityFilterVariableOperators';
import { updateConditionalAvailabilityFilter } from '@/conditional-availability/filter-builder/utils/updateConditionalAvailabilityFilter';
import { updateConditionalAvailabilityFilterOperator } from '@/conditional-availability/filter-builder/utils/updateConditionalAvailabilityFilterOperator';
import { DEFAULT_ADVANCED_FILTER_DROPDOWN_SIDE_OFFSET } from '@/object-record/advanced-filter/constants/DefaultAdvancedFilterDropdownSideOffset';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';

type ConditionalAvailabilityFilterOperatorSelectProps = {
  filter: ConditionalAvailabilityFilter;
};

export const ConditionalAvailabilityFilterOperatorSelect = ({
  filter,
}: ConditionalAvailabilityFilterOperatorSelectProps) => {
  const { readonly } = useConditionalAvailabilityFilterBuilderContextOrThrow();
  const { updateConditionalAvailabilityFilterSettings } =
    useUpdateConditionalAvailabilityFilterSettings();

  const operatorOptions = getConditionalAvailabilityFilterVariableOperators({
    variable: filter.variable,
  }).map((operator) => ({
    value: operator,
    label: getConditionalAvailabilityFilterOperatorLabel({ operator }),
  }));

  const handleOperatorChange = (
    operator: ConditionalAvailabilityFilterOperator,
  ) => {
    updateConditionalAvailabilityFilterSettings(
      (currentConditionalAvailabilityFilterGroup) =>
        updateConditionalAvailabilityFilter({
          filterGroup: currentConditionalAvailabilityFilterGroup,
          filterId: filter.id,
          update: (filterToUpdate) =>
            updateConditionalAvailabilityFilterOperator({
              filter: filterToUpdate,
              operator,
            }),
        }),
    );
  };

  return (
    <Select
      dropdownId={`conditional-availability-filter-operator-${filter.id}`}
      options={operatorOptions}
      value={filter.operator}
      onChange={handleOperatorChange}
      disabled={readonly}
      dropdownSideOffset={DEFAULT_ADVANCED_FILTER_DROPDOWN_SIDE_OFFSET}
      dropdownWidth={GenericDropdownContentWidth.Large}
      fullWidth
    />
  );
};
