import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

/**
 * @deprecated Use `isDropdownOpenComponentStateV2` instead.
 */
export const isDropdownOpenComponentState = createComponentState<boolean>({
  key: 'isDropdownOpenComponentState',
  defaultValue: false,
});
