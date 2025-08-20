import { useCallback } from 'react';

import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { VIEW_PICKER_DROPDOWN_ID } from '@/views/view-picker/constants/ViewPickerDropdownId';
import { VIEW_PICKER_KANBAN_FIELD_DROPDOWN_ID } from '@/views/view-picker/constants/ViewPickerKanbanFieldDropdownId';
import { VIEW_PICKER_VIEW_TYPE_DROPDOWN_ID } from '@/views/view-picker/constants/ViewPickerViewTypeDropdownId';
import { viewPickerIsPersistingComponentState } from '@/views/view-picker/states/viewPickerIsPersistingComponentState';
import { viewPickerModeComponentState } from '@/views/view-picker/states/viewPickerModeComponentState';

export const useCloseAndResetViewPicker = () => {
  const setViewPickerMode = useSetRecoilComponentState(
    viewPickerModeComponentState,
  );

  const setViewPickerIsPersisting = useSetRecoilComponentState(
    viewPickerIsPersistingComponentState,
  );

  const { closeDropdown } = useCloseDropdown();

  const closeAndResetViewPicker = useCallback(() => {
    setViewPickerIsPersisting(false);
    setViewPickerMode('list');
    closeDropdown(VIEW_PICKER_KANBAN_FIELD_DROPDOWN_ID);
    closeDropdown(VIEW_PICKER_VIEW_TYPE_DROPDOWN_ID);
    closeDropdown(VIEW_PICKER_DROPDOWN_ID);
  }, [closeDropdown, setViewPickerIsPersisting, setViewPickerMode]);

  return { closeAndResetViewPicker };
};
