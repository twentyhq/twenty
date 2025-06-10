import { ClickOutsideListenerComponentInstanceContext } from '@/ui/utilities/pointer-event/states/contexts/ClickOutsideListenerComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const clickOutsideListenerMouseDownHappenedComponentState =
  createComponentStateV2<boolean>({
    key: 'clickOutsideListenerMouseDownHappenedComponentState',
    defaultValue: false,
    componentInstanceContext: ClickOutsideListenerComponentInstanceContext,
  });
