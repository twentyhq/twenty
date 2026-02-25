import type { AddMenuItemInsertionContext } from '@/navigation-menu-item/types/AddMenuItemInsertionContext';

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const addMenuItemInsertionContextStateV2 =
  createAtomState<AddMenuItemInsertionContext | null>({
    key: 'addMenuItemInsertionContextStateV2',
    defaultValue: null,
  });
