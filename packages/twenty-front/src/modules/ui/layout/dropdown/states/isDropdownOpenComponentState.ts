import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const isDropdownOpenComponentState = createComponentState<boolean>({
  key: 'isDropdownOpenComponentState',
  defaultValue: false,
});
