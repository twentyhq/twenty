import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const isSoftFocusActiveComponentState = createComponentState<boolean>({
  key: 'isSoftFocusActiveComponentState',
  defaultValue: false,
});
