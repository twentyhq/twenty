import { ClickOutsideListenerComponentInstanceContext } from '@/ui/utilities/pointer-event/states/contexts/ClickOutsideListenerComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const clickOutsideListenerIsActivatedComponentState =
  createAtomComponentState<boolean>({
    key: 'clickOutsideListenerIsActivatedComponentState',
    defaultValue: true,
    componentInstanceContext: ClickOutsideListenerComponentInstanceContext,
  });
