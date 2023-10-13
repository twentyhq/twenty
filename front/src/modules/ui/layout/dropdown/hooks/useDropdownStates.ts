import { useRecoilScopedStateV2 } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedStateV2';

import { dropdownHotkeyScopeScopedState } from '../states/dropdownHotkeyScopeScopedState';
import { isDropdownOpenScopedState } from '../states/isDropdownOpenScopedState';

export const useDropdownStates = ({ scopeId }: { scopeId: string }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useRecoilScopedStateV2(
    isDropdownOpenScopedState,
    scopeId,
  );

  const [dropdownHotkeyScope, setDropdownHotkeyScope] = useRecoilScopedStateV2(
    dropdownHotkeyScopeScopedState,
    scopeId,
  );

  return {
    isDropdownOpen,
    setIsDropdownOpen,
    dropdownHotkeyScope,
    setDropdownHotkeyScope,
  };
};
