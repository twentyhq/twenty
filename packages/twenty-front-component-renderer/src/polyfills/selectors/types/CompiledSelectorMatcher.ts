import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { type SelectorMatchContext } from '@/polyfills/selectors/types/SelectorMatchContext';

export type CompiledSelectorMatcher = (
  element: SelectorElementLike,
  context: SelectorMatchContext,
) => boolean;
