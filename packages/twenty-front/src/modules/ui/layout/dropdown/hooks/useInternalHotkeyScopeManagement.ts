import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

import { useDropdownStates } from '@/ui/layout/dropdown/hooks/internal/useDropdownStates';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useInternalHotkeyScopeManagement = ({
  dropdownScopeId,
  dropdownHotkeyScopeFromParent,
}: {
  dropdownScopeId: string;
  dropdownHotkeyScopeFromParent?: HotkeyScope;
}) => {
  const { dropdownHotkeyScopeState } = useDropdownStates({ dropdownScopeId });

  const [dropdownHotkeyScope, setDropdownHotkeyScope] = useRecoilState(
    dropdownHotkeyScopeState,
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
