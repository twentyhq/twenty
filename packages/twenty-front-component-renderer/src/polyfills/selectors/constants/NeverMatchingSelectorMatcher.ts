import { type CompiledSelectorMatcher } from '@/polyfills/selectors/types/CompiledSelectorMatcher';

export const NEVER_MATCHING_SELECTOR_MATCHER: CompiledSelectorMatcher = () =>
  false;
