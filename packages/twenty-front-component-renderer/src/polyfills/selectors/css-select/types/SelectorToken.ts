import { type AttributeSelectorToken } from '@/polyfills/selectors/css-select/types/AttributeSelectorToken';
import { type PseudoClassSelectorToken } from '@/polyfills/selectors/css-select/types/PseudoClassSelectorToken';
import { type SelectorTraversalToken } from '@/polyfills/selectors/css-select/types/SelectorTraversalToken';

export type SelectorToken =
  | AttributeSelectorToken
  | PseudoClassSelectorToken
  | SelectorTraversalToken
  | { type: 'pseudo-element'; name: string; data: string | null }
  | { type: 'tag'; name: string; namespace: string | null }
  | { type: 'universal'; namespace: string | null };
