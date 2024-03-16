import { ClickOutsideListenerCallback } from '@/ui/utilities/pointer-event/types/ClickOutsideListenerCallback';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const clickOutsideListenerCallbacksComponentState = createComponentState<
  ClickOutsideListenerCallback[]
>({
  key: 'clickOutsideListenerCallbacksComponentState',
  defaultValue: [],
});
