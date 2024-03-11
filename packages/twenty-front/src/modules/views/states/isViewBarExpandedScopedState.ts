import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const isViewBarExpandedScopedState = createComponentState<boolean>({
  key: 'isViewBarExpandedScopedState',
  defaultValue: true,
});
