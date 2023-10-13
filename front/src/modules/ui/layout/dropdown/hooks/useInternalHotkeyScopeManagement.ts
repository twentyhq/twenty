import { useEffect } from 'react';

import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { useDropdown } from './useDropdown';

export const useInternalHotkeyScopeManagement = ({
  dropdownHotkeyScopeFromParent,
}: {
  dropdownHotkeyScopeFromParent?: HotkeyScope;
}) => {
  const { dropdownHotkeyScope, setDropdownHotkeyScope } = useDropdown();

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
