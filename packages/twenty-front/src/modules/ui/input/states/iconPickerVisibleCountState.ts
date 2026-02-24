import { createFamilyState } from '@/ui/utilities/state/jotai/utils/createFamilyState';

export const ICON_PICKER_DEFAULT_VISIBLE_COUNT = 25;

export const iconPickerVisibleCountState = createFamilyState<number, string>({
  key: 'iconPickerVisibleCountState',
  defaultValue: ICON_PICKER_DEFAULT_VISIBLE_COUNT,
});
