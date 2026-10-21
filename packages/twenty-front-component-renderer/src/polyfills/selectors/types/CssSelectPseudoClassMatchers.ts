import { type Options } from 'css-select';

import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';

export type CssSelectPseudoClassMatchers = NonNullable<
  Options<SelectorElementLike, SelectorElementLike>['pseudos']
>;
