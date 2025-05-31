import { objectFilterDropdownSearchInputIsVisibleComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputIsVisibleComponentState';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useGlobalHotkeys } from '@/ui/utilities/hotkey/hooks/useGlobalHotkeys';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { VIEW_BAR_FILTER_DROPDOWN_ID } from '@/views/constants/ViewBarFilterDropdownId';

export const useViewBarFilterHotKeys = () => {
  const setShowSearchInput = useSetRecoilComponentStateV2(
    objectFilterDropdownSearchInputIsVisibleComponentState,
    VIEW_BAR_FILTER_DROPDOWN_ID,
  );

  const { openDropdown } = useDropdown(VIEW_BAR_FILTER_DROPDOWN_ID);

  useGlobalHotkeys(
    'ctrl+f,meta+f',
    () => {
      openDropdown();
      setShowSearchInput(true);
    },
    true,
    AppHotkeyScope.ViewBarFilter,
    [openDropdown, setShowSearchInput],
  );
};
