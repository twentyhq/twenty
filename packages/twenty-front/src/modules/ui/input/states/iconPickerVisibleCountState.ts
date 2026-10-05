import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

import { ICON_PICKER_DEFAULT_VISIBLE_COUNT } from '@/ui/input/components/constants/IconPickerDefaultVisibleCount';

export const iconPickerVisibleCountState = createAtomFamilyState<
  number,
  string
>({
  key: 'iconPickerVisibleCountState',
  defaultValue: ICON_PICKER_DEFAULT_VISIBLE_COUNT,
});
