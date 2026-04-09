import { ClickOutsideListenerComponentInstanceContext } from '@/ui/utilities/pointer-event/states/contexts/ClickOutsideListenerComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const clickOutsideListenerMouseDownHappenedComponentState =
  createAtomComponentState<boolean>({
    key: 'clickOutsideListenerMouseDownHappenedComponentState',
    defaultValue: false,
    componentInstanceContext: ClickOutsideListenerComponentInstanceContext,
  });
