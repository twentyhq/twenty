import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { isElementChecked } from '@/polyfills/selectors/utils/isElementChecked';
import { iterateRadioButtonGroup } from '@/polyfills/selectors/utils/iterateRadioButtonGroup';

export const collectOtherCheckedRadioButtonsInGroup = (
  radioButton: SelectorElementLike,
): SelectorElementLike[] =>
  [...iterateRadioButtonGroup(radioButton)].filter(
    (groupRadioButton) =>
      groupRadioButton !== radioButton && isElementChecked(groupRadioButton),
  );
