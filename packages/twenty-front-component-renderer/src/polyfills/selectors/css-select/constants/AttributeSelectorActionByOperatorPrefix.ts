import { type AttributeSelectorAction } from '@/polyfills/selectors/css-select/types/AttributeSelectorAction';

export const ATTRIBUTE_SELECTOR_ACTION_BY_OPERATOR_PREFIX = new Map<
  string,
  AttributeSelectorAction
>([
  ['~', 'element'],
  ['^', 'start'],
  ['$', 'end'],
  ['*', 'any'],
  ['|', 'hyphen'],
]);
