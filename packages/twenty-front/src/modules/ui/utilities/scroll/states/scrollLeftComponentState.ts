import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const scrollLeftComponentState = createComponentState<number>({
  key: 'scroll/scrollLeftState',
  defaultValue: 0,
});
