import { useCallback } from 'react';

import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { VIEW_PICKER_DROPDOWN_ID } from '@/views/view-picker/constants/ViewPickerDropdownId';
import { VIEW_PICKER_KANBAN_FIELD_DROPDOWN_ID } from '@/views/view-picker/constants/ViewPickerKanbanFieldDropdownId';
import { VIEW_PICKER_VIEW_TYPE_DROPDOWN_ID } from '@/views/view-picker/constants/ViewPickerViewTypeDropdownId';
import { useViewPickerMode } from '@/views/view-picker/hooks/useViewPickerMode';
import { viewPickerIsPersistingComponentState } from '@/views/view-picker/states/viewPickerIsPersistingComponentState';

export const useCloseAndResetViewPicker = () => {
  const { setViewPickerMode } = useViewPickerMode();

  const setViewPickerIsPersisting = useSetRecoilComponentStateV2(
    viewPickerIsPersistingComponentState,
  );

  const { closeDropdown: closeViewPickerDropdown } = useDropdown(
    VIEW_PICKER_DROPDOWN_ID,
  );

  const { closeDropdown: closeKanbanFieldDropdown } = useDropdown(
    VIEW_PICKER_KANBAN_FIELD_DROPDOWN_ID,
  );

  const { closeDropdown: closeTypeDropdown } = useDropdown(
    VIEW_PICKER_VIEW_TYPE_DROPDOWN_ID,
  );

  const closeAndResetViewPicker = useCallback(() => {
    setViewPickerIsPersisting(false);
    setViewPickerMode('list');
    closeKanbanFieldDropdown();
    closeTypeDropdown();
    closeViewPickerDropdown();
  }, [
    closeKanbanFieldDropdown,
    closeTypeDropdown,
    closeViewPickerDropdown,
    setViewPickerIsPersisting,
    setViewPickerMode,
  ]);

  return { closeAndResetViewPicker };
};
