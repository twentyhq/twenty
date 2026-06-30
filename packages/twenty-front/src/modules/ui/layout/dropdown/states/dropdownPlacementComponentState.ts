import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

import { type Placement } from '@floating-ui/react';

export const dropdownPlacementComponentState =
  createAtomComponentState<Placement | null>({
    key: 'dropdownPlacementComponentState',
    componentInstanceContext: DropdownComponentInstanceContext,
    defaultValue: null,
  });
