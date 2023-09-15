import { useEffect } from 'react';

import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useRecoilScopedFamilyState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedFamilyState';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { dropdownButtonHotkeyScopeScopedFamilyState } from '../states/dropdownButtonHotkeyScopeScopedFamilyState';
import { DropdownRecoilScopeContext } from '../states/recoil-scope-contexts/DropdownRecoilScopeContext';

export const useInternalHotkeyScopeManagement = ({
  dropdownId,
  dropdownHotkeyScope,
}: {
  dropdownId: string;
  dropdownHotkeyScope?: HotkeyScope;
}) => {
  const [dropdownButtonHotkeyScope, setDropdownButtonHotkeyScope] =
    useRecoilScopedFamilyState(
      dropdownButtonHotkeyScopeScopedFamilyState,
      dropdownId,
      DropdownRecoilScopeContext,
    );

  useEffect(() => {
    if (!isDeeplyEqual(dropdownButtonHotkeyScope, dropdownHotkeyScope)) {
      setDropdownButtonHotkeyScope(dropdownHotkeyScope);
    }
  }, [
    dropdownHotkeyScope,
    dropdownButtonHotkeyScope,
    setDropdownButtonHotkeyScope,
  ]);
};
