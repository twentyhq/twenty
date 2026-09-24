import { type SelectorCompilationOptions } from '@/polyfills/selectors/css-select/types/SelectorCompilationOptions';
import { type SelectorToken } from '@/polyfills/selectors/css-select/types/SelectorToken';
import { type CompiledSelectorMatcher } from '@/polyfills/selectors/types/CompiledSelectorMatcher';

export type CompileSelectorTokenList = (input: {
  tokenList: SelectorToken[][];
  options: SelectorCompilationOptions;
  relativeSelectorAnchorMatcher?: CompiledSelectorMatcher;
}) => CompiledSelectorMatcher;
