import { RecordIndexHotkeyScope } from '@/object-record/record-index/types/RecordIndexHotkeyScope';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { VIEW_BAR_FILTER_DROPDOWN_ID } from '@/views/constants/ViewBarFilterDropdownId';
import { useOpenVectorSearchFilter } from '@/views/hooks/useOpenVectorSearchFilter';
import { useSetVectorSearchInputValueFromExistingFilter } from '@/views/hooks/useSetVectorSearchInputValueFromExistingFilter';
import { useEffect } from 'react';

export const ViewBarFilterDropdownVectorSearchHotkeyEffect = () => {
  const { openDropdown } = useDropdown(VIEW_BAR_FILTER_DROPDOWN_ID);
  const { setVectorSearchInputValueFromExistingFilter } =
    useSetVectorSearchInputValueFromExistingFilter(VIEW_BAR_FILTER_DROPDOWN_ID);
  const { openVectorSearchFilter } = useOpenVectorSearchFilter(
    VIEW_BAR_FILTER_DROPDOWN_ID,
  );

  const setHotkeyScope = useSetHotkeyScope();

  useEffect(() => {
    setHotkeyScope(RecordIndexHotkeyScope.RecordIndex);
  }, [setHotkeyScope]);

  useScopedHotkeys(
    'ctrl+f,meta+f',
    () => {
      setVectorSearchInputValueFromExistingFilter();
      openDropdown();
      openVectorSearchFilter();
    },
    RecordIndexHotkeyScope.RecordIndex,
    [
      openDropdown,
      openVectorSearchFilter,
      setVectorSearchInputValueFromExistingFilter,
    ],
  );

  return null;
};
