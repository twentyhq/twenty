import { useRecoilState } from 'recoil';

import { useScopeInternalContext } from '~/hooks/useScopeInternalContext';

import { DropdownScopeInternalContext } from '../scopes/scope-internal-context/DropdownScopeInternalContext';
import { isDropdownButtonOpenScopedFamilyState } from '../states/isDropdownButtonOpenScopedFamilyState';

export const useDropdownButtonInternal = () => {
  const dropdownScopeInternalContext = useScopeInternalContext(
    DropdownScopeInternalContext,
  );

  const dropdownScopeId = dropdownScopeInternalContext.scopeId;

  const [isDropdownOpen, setIsDropdownOpen] = useRecoilState(
    isDropdownButtonOpenScopedFamilyState(dropdownScopeId),
  );
};
