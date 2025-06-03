import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { VIEW_BAR_FILTER_DROPDOWN_ID } from '@/views/constants/ViewBarFilterDropdownId';

import { useOpenVectorSearchFilter } from '@/views/hooks/useOpenVectorSearchFilter';
import { useSetVectorSearchInputValueFromExistingFilter } from '@/views/hooks/useSetVectorSearchInputValueFromExistingFilter';
import { useEffect } from 'react';
import { ViewsHotkeyScope } from '../types/ViewsHotkeyScope';

export const useViewBarFilterHotKeys = () => {
  const { openDropdown } = useDropdown(VIEW_BAR_FILTER_DROPDOWN_ID);
  const { setVectorSearchInputValueFromExistingFilter } =
    useSetVectorSearchInputValueFromExistingFilter(VIEW_BAR_FILTER_DROPDOWN_ID);
  const { openVectorSearchFilter } = useOpenVectorSearchFilter(
    VIEW_BAR_FILTER_DROPDOWN_ID,
  );
  const setHotkeyScope = useSetHotkeyScope();

  useEffect(() => {
    setHotkeyScope(ViewsHotkeyScope.ViewBarFilter);
  }, [setHotkeyScope]);

  useScopedHotkeys(
    'ctrl+f,meta+f',
    () => {
      setVectorSearchInputValueFromExistingFilter();
      openDropdown();
      openVectorSearchFilter();
    },
    ViewsHotkeyScope.ViewBarFilter,
    [
      openDropdown,
      openVectorSearchFilter,
      setVectorSearchInputValueFromExistingFilter,
    ],
  );
};
