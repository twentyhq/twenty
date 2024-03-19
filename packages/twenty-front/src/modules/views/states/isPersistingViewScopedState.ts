import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const isPersistingViewScopedState = createComponentState<boolean>({
  key: 'isPersistingViewScopedState',
  defaultValue: false,
});
