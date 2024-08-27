import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const scrollLeftComponentState = createComponentState<number>({
  key: 'scroll/scrollLeftComponentState',
  defaultValue: 0,
});
