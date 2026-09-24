import { type AttributeSelectorAction } from '@/polyfills/selectors/css-select/types/AttributeSelectorAction';

export type AttributeSelectorToken = {
  type: 'attribute';
  name: string;
  action: AttributeSelectorAction;
  value: string;
  namespace: string | null;
  ignoreCase: boolean | null;
};
