import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';
import { ModalComponentInstanceContext } from '@/ui/layout/modal/contexts/ModalComponentInstanceContext';

export const isModalOpenedComponentState = createComponentState<boolean>({
  key: 'isModalOpenedComponentState',
  defaultValue: false,
  componentInstanceContext: ModalComponentInstanceContext,
});
