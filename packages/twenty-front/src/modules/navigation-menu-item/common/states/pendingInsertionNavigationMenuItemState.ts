import type { PendingInsertionNavigationMenuItem } from '@/navigation-menu-item/common/types/PendingInsertionNavigationMenuItem';

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const pendingInsertionNavigationMenuItemState =
  createAtomState<PendingInsertionNavigationMenuItem | null>({
    key: 'pendingInsertionNavigationMenuItemState',
    defaultValue: null,
  });
