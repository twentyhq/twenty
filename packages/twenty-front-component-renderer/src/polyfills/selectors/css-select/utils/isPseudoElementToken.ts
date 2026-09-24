import { isDefined } from 'twenty-shared/utils';

import { LEGACY_PSEUDO_ELEMENT_NAMES } from '@/polyfills/selectors/constants/LegacyPseudoElementNames';
import { type SelectorToken } from '@/polyfills/selectors/css-select/types/SelectorToken';

export const isPseudoElementToken = (token: SelectorToken): boolean =>
  token.type === 'pseudo-element' ||
  (token.type === 'pseudo' &&
    !isDefined(token.data) &&
    LEGACY_PSEUDO_ELEMENT_NAMES.has(token.name));
