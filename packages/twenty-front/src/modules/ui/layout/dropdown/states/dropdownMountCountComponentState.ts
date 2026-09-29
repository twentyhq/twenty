import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const dropdownMountCountComponentState =
  createAtomComponentState<number>({
    key: 'dropdownMountCountComponentState',
    defaultValue: 0,
    componentInstanceContext: DropdownComponentInstanceContext,
  });
