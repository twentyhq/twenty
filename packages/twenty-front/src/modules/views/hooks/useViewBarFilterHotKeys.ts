import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useGlobalHotkeys } from '@/ui/utilities/hotkey/hooks/useGlobalHotkeys';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';
import { VIEW_BAR_FILTER_DROPDOWN_ID } from '@/views/constants/ViewBarFilterDropdownId';
import { useSearchFilter } from '@/views/hooks/useSearchFilter';

export const useViewBarFilterHotKeys = () => {
  const { openDropdown } = useDropdown(VIEW_BAR_FILTER_DROPDOWN_ID);
  const { setShowSearchInput, setSearchInputValueFromExistingFilter } =
    useSearchFilter(VIEW_BAR_FILTER_DROPDOWN_ID);

  useGlobalHotkeys(
    'ctrl+f,meta+f',
    () => {
      setSearchInputValueFromExistingFilter();
      openDropdown();
      setShowSearchInput(true);
    },
    true,
    AppHotkeyScope.ViewBarFilter,
    [openDropdown, setShowSearchInput, setSearchInputValueFromExistingFilter],
  );
};
