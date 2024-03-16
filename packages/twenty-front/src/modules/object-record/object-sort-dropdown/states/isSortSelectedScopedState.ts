import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const isSortSelectedScopedState = createComponentState<boolean>({
  key: 'isSortSelectedScopedState',
  defaultValue: false,
});
