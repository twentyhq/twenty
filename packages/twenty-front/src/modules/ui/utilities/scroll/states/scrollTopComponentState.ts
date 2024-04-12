import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const scrollTopComponentState = createComponentState<number>({
  key: 'scroll/scrollTopState',
  defaultValue: 0,
});
