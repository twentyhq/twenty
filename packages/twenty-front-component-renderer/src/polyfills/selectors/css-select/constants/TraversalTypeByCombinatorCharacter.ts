import { type SelectorTraversalType } from '@/polyfills/selectors/css-select/types/SelectorTraversalType';

export const TRAVERSAL_TYPE_BY_COMBINATOR_CHARACTER = new Map<
  string,
  SelectorTraversalType
>([
  ['>', 'child'],
  ['~', 'sibling'],
  ['+', 'adjacent'],
]);
