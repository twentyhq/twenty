import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { type SelectorMatcher } from '@/polyfills/selectors/types/SelectorMatcher';

export type SelectorMatcherResolver = {
  resolveSelectorMatcher: (input: {
    selectorsText: string;
    scopeElement: SelectorElementLike;
  }) => SelectorMatcher;
};
