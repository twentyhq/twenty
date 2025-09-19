import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';

export const iconPickerVisibleCountState = createFamilyState<number, string>({
  key: 'iconPickerVisibleCountState',
  defaultValue: 25,
});
