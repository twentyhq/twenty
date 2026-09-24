import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';

export const ARGUMENT_PSEUDO_CLASS_MATCHER_BY_NAME = new Map<
  string,
  (element: SelectorElementLike, argument: string) => boolean
>([['state', () => false]]);
