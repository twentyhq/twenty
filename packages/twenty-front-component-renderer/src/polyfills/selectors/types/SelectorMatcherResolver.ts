import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';

export type SelectorMatcherResolver = {
  resolveSelectorMatcher: (input: {
    selectorsText: string;
    scopeElement: SelectorElementLike;
  }) => (element: SelectorElementLike) => boolean;
};
