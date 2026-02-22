import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const isDropdownOpenComponentState = createComponentStateV2<boolean>({
  key: 'isDropdownOpenComponentState',
  defaultValue: false,
  componentInstanceContext: DropdownComponentInstanceContext,
});
