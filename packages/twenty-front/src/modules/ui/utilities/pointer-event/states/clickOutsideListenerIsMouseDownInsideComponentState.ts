import { ClickOutsideListenerComponentInstanceContext } from '@/ui/utilities/pointer-event/states/contexts/ClickOutsideListenerComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const clickOutsideListenerIsMouseDownInsideComponentState =
  createComponentStateV2<boolean>({
    key: 'clickOutsideListenerIsMouseDownInsideComponentState',
    defaultValue: false,
    componentInstanceContext: ClickOutsideListenerComponentInstanceContext,
  });
