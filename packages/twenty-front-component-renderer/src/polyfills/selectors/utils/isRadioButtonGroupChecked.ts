import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { isElementChecked } from '@/polyfills/selectors/utils/isElementChecked';
import { iterateRadioButtonGroup } from '@/polyfills/selectors/utils/iterateRadioButtonGroup';

export const isRadioButtonGroupChecked = (
  radio: SelectorElementLike,
): boolean => {
  for (const groupMember of iterateRadioButtonGroup(radio)) {
    if (isElementChecked(groupMember)) {
      return true;
    }
  }

  return false;
};
