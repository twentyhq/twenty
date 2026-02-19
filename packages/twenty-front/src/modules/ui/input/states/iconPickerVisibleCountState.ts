import { createFamilyStateV2 } from '@/ui/utilities/state/jotai/utils/createFamilyStateV2';

export const ICON_PICKER_DEFAULT_VISIBLE_COUNT = 25;

export const iconPickerVisibleCountState = createFamilyStateV2<number, string>({
  key: 'iconPickerVisibleCountState',
  defaultValue: ICON_PICKER_DEFAULT_VISIBLE_COUNT,
});
