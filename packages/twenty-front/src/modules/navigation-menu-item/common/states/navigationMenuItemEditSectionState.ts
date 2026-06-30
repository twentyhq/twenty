import type { NavigationMenuItemSection } from '@/navigation-menu-item/common/types/NavigationMenuItemSection';

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const navigationMenuItemEditSectionState =
  createAtomState<NavigationMenuItemSection>({
    key: 'navigationMenuItemEditSectionState',
    defaultValue: 'workspace',
  });
