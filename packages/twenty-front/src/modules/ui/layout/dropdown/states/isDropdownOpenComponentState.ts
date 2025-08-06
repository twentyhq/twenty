import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const isDropdownOpenComponentState = createComponentState<boolean>({
  key: 'isDropdownOpenComponentState',
  defaultValue: false,
  componentInstanceContext: DropdownComponentInstanceContext,
});
