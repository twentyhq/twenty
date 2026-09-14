import { VIEW_PICKER_DROPDOWN_ID } from '@/views/view-picker/constants/ViewPickerDropdownId';

export const getViewPickerDropdownId = (viewBarId: string) =>
  `${VIEW_PICKER_DROPDOWN_ID}-${viewBarId}`;
