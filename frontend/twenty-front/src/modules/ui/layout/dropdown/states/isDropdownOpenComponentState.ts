import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const isDropdownOpenComponentState = createAtomComponentState<boolean>({
  key: 'isDropdownOpenComponentState',
  defaultValue: false,
  componentInstanceContext: DropdownComponentInstanceContext,
});
