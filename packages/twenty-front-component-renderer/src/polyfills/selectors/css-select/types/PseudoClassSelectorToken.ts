import { type SelectorToken } from '@/polyfills/selectors/css-select/types/SelectorToken';

export type PseudoClassSelectorToken = {
  type: 'pseudo';
  name: string;
  data: SelectorToken[][] | string | null;
};
