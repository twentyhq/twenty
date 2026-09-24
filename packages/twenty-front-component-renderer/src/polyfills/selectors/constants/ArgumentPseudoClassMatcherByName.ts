import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { doesElementMatchLanguageRanges } from '@/polyfills/selectors/utils/doesElementMatchLanguageRanges';
import { resolveElementDirectionality } from '@/polyfills/selectors/utils/resolveElementDirectionality';

export const ARGUMENT_PSEUDO_CLASS_MATCHER_BY_NAME = new Map<
  string,
  (element: SelectorElementLike, argument: string) => boolean
>([
  [
    'dir',
    (element, directionality) =>
      resolveElementDirectionality(element) === directionality.toLowerCase(),
  ],
  [
    'lang',
    (element, languageRanges) =>
      doesElementMatchLanguageRanges({ element, languageRanges }),
  ],
  ['state', () => false],
]);
