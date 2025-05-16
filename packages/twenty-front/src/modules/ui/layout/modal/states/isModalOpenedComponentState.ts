import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { ModalComponentInstanceContext } from '../contexts/ModalComponentInstanceContext';

export const isModalOpenedComponentState = createComponentStateV2<boolean>({
  key: 'isModalOpenedComponentState',
  defaultValue: false,
  componentInstanceContext: ModalComponentInstanceContext,
});
