import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

import { Placement } from '@floating-ui/react';

export const dropdownPlacementComponentStateV2 =
  createComponentStateV2<Placement | null>({
    key: 'dropdownPlacementComponentState',
    componentInstanceContext: DropdownComponentInstanceContext,
    defaultValue: null,
  });
