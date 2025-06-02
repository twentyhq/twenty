import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { VIEW_BAR_FILTER_DROPDOWN_ID } from '@/views/constants/ViewBarFilterDropdownId';
import { useSearchInputState } from '@/views/hooks/useSearchInputState';
import { useEffect } from 'react';
import { ViewsHotkeyScope } from '../types/ViewsHotkeyScope';

export const useViewBarFilterHotKeys = () => {
  const { openDropdown } = useDropdown(VIEW_BAR_FILTER_DROPDOWN_ID);
  const { setShowSearchInput, setSearchInputValueFromExistingFilter } =
    useSearchInputState(VIEW_BAR_FILTER_DROPDOWN_ID);
  const setHotkeyScope = useSetHotkeyScope();

  useEffect(() => {
    setHotkeyScope(ViewsHotkeyScope.ViewBarFilter);
  }, [setHotkeyScope]);

  useScopedHotkeys(
    'ctrl+f,meta+f',
    () => {
      setSearchInputValueFromExistingFilter();
      openDropdown();
      setShowSearchInput(true);
    },
    ViewsHotkeyScope.ViewBarFilter,
    [openDropdown, setShowSearchInput, setSearchInputValueFromExistingFilter],
  );
};
