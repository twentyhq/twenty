import { type Options } from 'css-select';

import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';

export type CssSelectAdapter = NonNullable<
  Options<SelectorElementLike, SelectorElementLike>['adapter']
>;
