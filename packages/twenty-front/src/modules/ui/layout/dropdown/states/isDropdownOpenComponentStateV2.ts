import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const isDropdownOpenComponentStateV2 = createComponentStateV2<boolean>({
  key: 'isDropdownOpenComponentStateV2',
  defaultValue: false,
  componentInstanceContext: DropdownComponentInstanceContext,
});
