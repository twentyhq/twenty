import type { AddMenuItemInsertionContext } from '@/navigation-menu-item/common/types/AddMenuItemInsertionContext';

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const addMenuItemInsertionContextState =
  createAtomState<AddMenuItemInsertionContext | null>({
    key: 'addMenuItemInsertionContextState',
    defaultValue: null,
  });
