import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { doesElementMatchLanguageRanges } from '@/polyfills/selectors/utils/doesElementMatchLanguageRanges';
import { resolveElementDirectionality } from '@/polyfills/selectors/utils/resolveElementDirectionality';

export const ARGUMENT_PSEUDO_CLASS_MATCHER_BY_NAME: Record<
  string,
  (element: SelectorElementLike, argument?: string | null) => boolean
> = {
  dir: (element, directionality) =>
    resolveElementDirectionality(element) ===
    directionality?.trim().toLowerCase(),
  lang: (element, languageRanges) =>
    doesElementMatchLanguageRanges({
      element,
      languageRanges: languageRanges ?? null,
    }),
};
