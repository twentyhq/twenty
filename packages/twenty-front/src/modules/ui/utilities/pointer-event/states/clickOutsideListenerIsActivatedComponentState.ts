import { ClickOutsideListenerComponentInstanceContext } from '@/ui/utilities/pointer-event/states/contexts/ClickOutsideListenerComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const clickOutsideListenerIsActivatedComponentState =
  createComponentState<boolean>({
    key: 'clickOutsideListenerIsActivatedComponentState',
    defaultValue: true,
    componentInstanceContext: ClickOutsideListenerComponentInstanceContext,
  });
