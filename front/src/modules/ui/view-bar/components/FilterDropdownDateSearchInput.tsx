import { DatePicker } from '@/ui/input/components/DatePicker';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useUpsertFilter } from '@/ui/view-bar/hooks/useUpsertFilter';
import { filterDefinitionUsedInDropdownScopedState } from '@/ui/view-bar/states/filterDefinitionUsedInDropdownScopedState';
import { selectedOperandInDropdownScopedState } from '@/ui/view-bar/states/selectedOperandInDropdownScopedState';

import { useViewBarContext } from '../hooks/useViewBarContext';
import { isFilterDropdownUnfoldedScopedState } from '../states/isFilterDropdownUnfoldedScopedState';

export function FilterDropdownDateSearchInput() {
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

  function handleChange(date: Date) {
    if (!filterDefinitionUsedInDropdown || !selectedOperandInDropdown) return;

    upsertFilter({
      key: filterDefinitionUsedInDropdown.key,
      type: filterDefinitionUsedInDropdown.type,
      value: date.toISOString(),
      operand: selectedOperandInDropdown,
      displayValue: date.toLocaleDateString(),
    });

    setIsFilterDropdownUnfolded(false);
  }

  return (
    <DatePicker
      date={new Date()}
      onChange={handleChange}
      onMouseSelect={handleChange}
    />
  );
}
