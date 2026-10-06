import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const mountedDropdownRootCountComponentState =
  createAtomComponentState<number>({
    key: 'mountedDropdownRootCountComponentState',
    componentInstanceContext: DropdownComponentInstanceContext,
    defaultValue: 0,
  });
