import { useUpsertFilter } from '@/views/components/view-bar/hooks/useUpsertFilter';
import { filterDefinitionUsedInDropdownScopedState } from '@/views/components/view-bar/states/filterDefinitionUsedInDropdownScopedState';
import { selectedOperandInDropdownScopedState } from '@/views/components/view-bar/states/selectedOperandInDropdownScopedState';
import { InternalDatePicker } from '@/ui/input/components/internal/date/components/InternalDatePicker';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { useViewBarContext } from '../../../../views/components/view-bar/hooks/useViewBarContext';
import { isFilterDropdownUnfoldedScopedState } from '../../../../views/components/view-bar/states/isFilterDropdownUnfoldedScopedState';

export const FilterDropdownDateSearchInput = () => {
  const { ViewBarRecoilScopeContext } = useViewBarContext();

  const [filterDefinitionUsedInDropdown] = useRecoilScopedState(
    filterDefinitionUsedInDropdownScopedState,
    ViewBarRecoilScopeContext,
  );

  const [selectedOperandInDropdown] = useRecoilScopedState(
    selectedOperandInDropdownScopedState,
    ViewBarRecoilScopeContext,
  );

  const [, setIsFilterDropdownUnfolded] = useRecoilScopedState(
    isFilterDropdownUnfoldedScopedState,
    ViewBarRecoilScopeContext,
  );

  const upsertFilter = useUpsertFilter();

  const handleChange = (date: Date) => {
    if (!filterDefinitionUsedInDropdown || !selectedOperandInDropdown) return;

    upsertFilter({
      key: filterDefinitionUsedInDropdown.key,
      type: filterDefinitionUsedInDropdown.type,
      value: date.toISOString(),
      operand: selectedOperandInDropdown,
      displayValue: date.toLocaleDateString(),
    });

    setIsFilterDropdownUnfolded(false);
  };

  return (
    <InternalDatePicker
      date={new Date()}
      onChange={handleChange}
      onMouseSelect={handleChange}
    />
  );
};
