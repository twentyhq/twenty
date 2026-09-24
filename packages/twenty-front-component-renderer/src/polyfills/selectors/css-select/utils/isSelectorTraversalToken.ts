import { type SelectorToken } from '@/polyfills/selectors/css-select/types/SelectorToken';
import { type SelectorTraversalToken } from '@/polyfills/selectors/css-select/types/SelectorTraversalToken';

export const isSelectorTraversalToken = (
  token: SelectorToken,
): token is SelectorTraversalToken =>
  token.type === 'adjacent' ||
  token.type === 'child' ||
  token.type === 'descendant' ||
  token.type === 'sibling';
