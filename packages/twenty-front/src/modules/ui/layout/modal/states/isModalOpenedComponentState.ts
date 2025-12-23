import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { ModalComponentInstanceContext } from '@/ui/layout/modal/contexts/ModalComponentInstanceContext';

export const isModalOpenedComponentState = createComponentState<boolean>({
  key: 'isModalOpenedComponentState',
  defaultValue: false,
  componentInstanceContext: ModalComponentInstanceContext,
});
