import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const scrollTopComponentState = createComponentState<number>({
  key: 'scroll/scrollTopComponentState',
  defaultValue: 0,
});
