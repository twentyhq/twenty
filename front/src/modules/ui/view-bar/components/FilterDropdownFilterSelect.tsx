import { DropdownMenuItemsContainer } from '@/ui/dropdown/components/DropdownMenuItemsContainer';
import { RelationPickerHotkeyScope } from '@/ui/input/relation-picker/types/RelationPickerHotkeyScope';
import { MenuItem } from '@/ui/menu-item/components/MenuItem';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';

import { useViewBarContext } from '../hooks/useViewBarContext';
import { availableFiltersScopedState } from '../states/availableFiltersScopedState';
import { filterDefinitionUsedInDropdownScopedState } from '../states/filterDefinitionUsedInDropdownScopedState';
import { filterDropdownSearchInputScopedState } from '../states/filterDropdownSearchInputScopedState';
import { selectedOperandInDropdownScopedState } from '../states/selectedOperandInDropdownScopedState';
import { getOperandsForFilterType } from '../utils/getOperandsForFilterType';

export const FilterDropdownFilterSelect = () => {
  const { ViewBarRecoilScopeContext } = useViewBarContext();

  const [, setFilterDefinitionUsedInDropdown] = useRecoilScopedState(
    filterDefinitionUsedInDropdownScopedState,
    ViewBarRecoilScopeContext,
  );

  const [, setSelectedOperandInDropdown] = useRecoilScopedState(
    selectedOperandInDropdownScopedState,
    ViewBarRecoilScopeContext,
  );

  const [, setFilterDropdownSearchInput] = useRecoilScopedState(
    filterDropdownSearchInputScopedState,
    ViewBarRecoilScopeContext,
  );

  const availableFilters = useRecoilScopedValue(
    availableFiltersScopedState,
    ViewBarRecoilScopeContext,
  );

  const setHotkeyScope = useSetHotkeyScope();

  return (
    <DropdownMenuItemsContainer>
      {availableFilters.map((availableFilter, index) => (
        <MenuItem
          key={`select-filter-${index}`}
          testId={`select-filter-${index}`}
          onClick={() => {
            setFilterDefinitionUsedInDropdown(availableFilter);

            if (availableFilter.type === 'entity') {
              setHotkeyScope(RelationPickerHotkeyScope.RelationPicker);
            }

            setSelectedOperandInDropdown(
              getOperandsForFilterType(availableFilter.type)?.[0],
            );

            setFilterDropdownSearchInput('');
          }}
          LeftIcon={availableFilter.Icon}
          text={availableFilter.label}
        />
      ))}
    </DropdownMenuItemsContainer>
  );
};
