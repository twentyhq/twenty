import { useEffect } from 'react';

import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useRecoilScopedStateV2 } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedStateV2';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { dropdownHotkeyScopeScopedState } from '../states/dropdownHotkeyScopeScopedState';

export const useInternalHotkeyScopeManagement = ({
  dropdownScopeId,
  dropdownHotkeyScopeFromParent,
}: {
  dropdownScopeId: string;
  dropdownHotkeyScopeFromParent?: HotkeyScope;
}) => {
  const [dropdownHotkeyScope, setDropdownHotkeyScope] = useRecoilScopedStateV2(
    dropdownHotkeyScopeScopedState,
    dropdownScopeId,
  );

  useEffect(() => {
    if (!isDeeplyEqual(dropdownHotkeyScopeFromParent, dropdownHotkeyScope)) {
      setDropdownHotkeyScope(dropdownHotkeyScopeFromParent);
    }
  }, [
    dropdownHotkeyScope,
    dropdownHotkeyScopeFromParent,
    setDropdownHotkeyScope,
  ]);
};
