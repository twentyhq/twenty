import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const isBottomBarOpenComponentState = createComponentState<boolean>({
  key: 'isBottomBarOpenComponentState',
  defaultValue: false,
});
