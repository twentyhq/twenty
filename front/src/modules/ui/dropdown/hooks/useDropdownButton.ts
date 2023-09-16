import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useRecoilScopedFamilyState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedFamilyState';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useViewBarContext } from '@/ui/view-bar/hooks/useViewBarContext';
import { filterDefinitionUsedInDropdownScopedState } from '@/ui/view-bar/states/filterDefinitionUsedInDropdownScopedState';
import { filterDropdownSearchInputScopedState } from '@/ui/view-bar/states/filterDropdownSearchInputScopedState';
import { isFilterDropdownOperandSelectUnfoldedScopedState } from '@/ui/view-bar/states/isFilterDropdownOperandSelectUnfoldedScopedState';
import { selectedOperandInDropdownScopedState } from '@/ui/view-bar/states/selectedOperandInDropdownScopedState';

import { dropdownButtonHotkeyScopeScopedFamilyState } from '../states/dropdownButtonHotkeyScopeScopedFamilyState';
import { isDropdownButtonOpenScopedFamilyState } from '../states/isDropdownButtonOpenScopedFamilyState';
import { DropdownRecoilScopeContext } from '../states/recoil-scope-contexts/DropdownRecoilScopeContext';

export const useDropdownButton = ({ dropdownId }: { dropdownId: string }) => {
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const { ViewBarRecoilScopeContext } = useViewBarContext();

  const [, setIsFilterDropdownOperandSelectUnfolded] = useRecoilScopedState(
    isFilterDropdownOperandSelectUnfoldedScopedState,
    ViewBarRecoilScopeContext,
  );

  const [, setFilterDefinitionUsedInDropdown] = useRecoilScopedState(
    filterDefinitionUsedInDropdownScopedState,
    ViewBarRecoilScopeContext,
  );

  const [, setFilterDropdownSearchInput] = useRecoilScopedState(
    filterDropdownSearchInputScopedState,
    ViewBarRecoilScopeContext,
  );

  const [, setSelectedOperandInDropdown] = useRecoilScopedState(
    selectedOperandInDropdownScopedState,
    ViewBarRecoilScopeContext,
  );

  const resetState = () => {
    setIsFilterDropdownOperandSelectUnfolded(false);
    setFilterDefinitionUsedInDropdown(null);
    setSelectedOperandInDropdown(null);
    setFilterDropdownSearchInput('');
    toggleDropdownButton();
  };

  const [isDropdownButtonOpen, setIsDropdownButtonOpen] =
    useRecoilScopedFamilyState(
      isDropdownButtonOpenScopedFamilyState,
      dropdownId,
      DropdownRecoilScopeContext,
    );

  const [dropdownButtonHotkeyScope] = useRecoilScopedFamilyState(
    dropdownButtonHotkeyScopeScopedFamilyState,
    dropdownId,
    DropdownRecoilScopeContext,
  );

  const closeDropdownButton = () => {
    goBackToPreviousHotkeyScope();
    setIsDropdownButtonOpen(false);
  };

  const openDropdownButton = () => {
    setIsDropdownButtonOpen(true);

    if (dropdownButtonHotkeyScope) {
      setHotkeyScopeAndMemorizePreviousScope(
        dropdownButtonHotkeyScope.scope,
        dropdownButtonHotkeyScope.customScopes,
      );
    }
  };

  const toggleDropdownButton = () => {
    if (isDropdownButtonOpen) {
      closeDropdownButton();
    } else {
      openDropdownButton();
    }
  };

  return {
    isDropdownButtonOpen,
    closeDropdownButton,
    toggleDropdownButton,
    openDropdownButton,
    resetState,
  };
};
