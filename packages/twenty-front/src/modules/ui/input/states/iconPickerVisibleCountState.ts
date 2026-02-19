import { createFamilyStateV2 } from '@/ui/utilities/state/jotai/utils/createFamilyStateV2';

export const iconPickerVisibleCountState = createFamilyStateV2<number, string>({
  key: 'iconPickerVisibleCountState',
  defaultValue: 25,
});
