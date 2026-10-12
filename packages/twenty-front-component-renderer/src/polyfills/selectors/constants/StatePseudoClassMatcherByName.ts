import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { canElementBeDisabled } from '@/polyfills/selectors/utils/canElementBeDisabled';
import { canElementBeRequired } from '@/polyfills/selectors/utils/canElementBeRequired';
import { isElementChecked } from '@/polyfills/selectors/utils/isElementChecked';
import { isElementDisabled } from '@/polyfills/selectors/utils/isElementDisabled';
import { isElementIndeterminate } from '@/polyfills/selectors/utils/isElementIndeterminate';
import { isElementLink } from '@/polyfills/selectors/utils/isElementLink';
import { isElementOpen } from '@/polyfills/selectors/utils/isElementOpen';
import { isElementPlaceholderShown } from '@/polyfills/selectors/utils/isElementPlaceholderShown';
import { isElementReadWrite } from '@/polyfills/selectors/utils/isElementReadWrite';
import { isElementRequired } from '@/polyfills/selectors/utils/isElementRequired';

export const STATE_PSEUDO_CLASS_MATCHER_BY_NAME: Record<
  string,
  (element: SelectorElementLike) => boolean
> = {
  'any-link': isElementLink,
  checked: isElementChecked,
  disabled: isElementDisabled,
  enabled: (element) =>
    canElementBeDisabled(element) && !isElementDisabled(element),
  indeterminate: isElementIndeterminate,
  link: isElementLink,
  open: isElementOpen,
  optional: (element) =>
    canElementBeRequired(element) && !isElementRequired(element),
  'placeholder-shown': isElementPlaceholderShown,
  'read-only': (element) => !isElementReadWrite(element),
  'read-write': isElementReadWrite,
  required: isElementRequired,
};
