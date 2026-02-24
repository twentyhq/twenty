import { ClickOutsideListenerComponentInstanceContext } from '@/ui/utilities/pointer-event/states/contexts/ClickOutsideListenerComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const clickOutsideListenerMouseDownHappenedComponentState =
  createComponentState<boolean>({
    key: 'clickOutsideListenerMouseDownHappenedComponentState',
    defaultValue: false,
    componentInstanceContext: ClickOutsideListenerComponentInstanceContext,
  });
