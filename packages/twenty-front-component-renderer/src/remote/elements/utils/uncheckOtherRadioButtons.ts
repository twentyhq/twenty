import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { iterateRadioButtonGroup } from '@/polyfills/selectors/utils/iterateRadioButtonGroup';

export const uncheckOtherRadioButtons = (radio: SelectorElementLike): void => {
  for (const groupMember of iterateRadioButtonGroup(radio)) {
    if (groupMember !== radio) {
      groupMember.checked = false;
    }
  }
};
