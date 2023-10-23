import { RelationPickerHotkeyScope } from '@/ui/input/relation-picker/types/RelationPickerHotkeyScope';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';

import { useViewBarContext } from '../../view-bar/hooks/useViewBarContext';
import { availableFiltersScopedState } from '../../view-bar/states/availableFiltersScopedState';
import { filterDefinitionUsedInDropdownScopedState } from '../../view-bar/states/filterDefinitionUsedInDropdownScopedState';
import { filterDropdownSearchInputScopedState } from '../../view-bar/states/filterDropdownSearchInputScopedState';
import { selectedOperandInDropdownScopedState } from '../../view-bar/states/selectedOperandInDropdownScopedState';
import { getOperandsForFilterType } from '../../view-bar/utils/getOperandsForFilterType';

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
