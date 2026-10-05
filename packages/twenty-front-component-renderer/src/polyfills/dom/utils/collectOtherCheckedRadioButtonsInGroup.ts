import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { iterateRadioButtonGroup } from '@/polyfills/selectors/utils/iterateRadioButtonGroup';

export const collectOtherCheckedRadioButtonsInGroup = (
  radioButton: SelectorElementLike,
): SelectorElementLike[] =>
  [...iterateRadioButtonGroup(radioButton)].filter(
    (groupRadioButton) =>
      groupRadioButton !== radioButton && groupRadioButton.checked === true,
  );
