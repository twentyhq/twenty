import { useScopeInternalContext } from '@/ui/utilities/recoil-scope/scopes-internal/utils/useScopeInternalContext';

import { DropdownScopeInternalContext } from '../scopes/scope-internal-context/DropdownScopeInternalContext';

import { useDropdown } from './useDropdown';

export const useDropdownInternal = () => {
  const dropdownScopeInternalContext = useScopeInternalContext(
    DropdownScopeInternalContext,
  );

  const dropdownScopeId = dropdownScopeInternalContext.scopeId;

  const { closeDropdown, openDropdown, isDropdownOpen, toggleDropdown } =
    useDropdown({ dropdownScopeId: dropdownScopeId });

  return {
    isDropdownOpen,
    closeDropdown,
    openDropdown,
    toggleDropdown,
  };
};
