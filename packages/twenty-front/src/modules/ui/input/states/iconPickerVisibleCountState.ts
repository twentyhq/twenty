import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const ICON_PICKER_DEFAULT_VISIBLE_COUNT = 25;

export const iconPickerVisibleCountState = createAtomFamilyState<
  number,
  string
>({
  key: 'iconPickerVisibleCountState',
  defaultValue: ICON_PICKER_DEFAULT_VISIBLE_COUNT,
});
