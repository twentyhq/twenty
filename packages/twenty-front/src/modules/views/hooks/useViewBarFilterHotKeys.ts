import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { VIEW_BAR_FILTER_DROPDOWN_ID } from '@/views/constants/ViewBarFilterDropdownId';

import { useOpenSearchFilter } from '@/views/hooks/useOpenSearchFilter';
import { useSearchInputState } from '@/views/hooks/useSearchInputState';
import { useEffect } from 'react';
import { ViewsHotkeyScope } from '../types/ViewsHotkeyScope';

export const useViewBarFilterHotKeys = () => {
  const { openDropdown } = useDropdown(VIEW_BAR_FILTER_DROPDOWN_ID);
  const { setSearchInputValueFromExistingFilter } = useSearchInputState(
    VIEW_BAR_FILTER_DROPDOWN_ID,
  );
  const { openSearchFilter } = useOpenSearchFilter();
  const setHotkeyScope = useSetHotkeyScope();

  useEffect(() => {
    setHotkeyScope(ViewsHotkeyScope.ViewBarFilter);
  }, [setHotkeyScope]);

  useScopedHotkeys(
    'ctrl+f,meta+f',
    () => {
      setSearchInputValueFromExistingFilter();
      openDropdown();
      openSearchFilter();
    },
    ViewsHotkeyScope.ViewBarFilter,
    [openDropdown, openSearchFilter, setSearchInputValueFromExistingFilter],
  );
};
