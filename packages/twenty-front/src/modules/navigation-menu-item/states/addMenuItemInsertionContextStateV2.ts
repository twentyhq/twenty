import type { AddMenuItemInsertionContext } from '@/navigation-menu-item/types/AddMenuItemInsertionContext';

import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const addMenuItemInsertionContextStateV2 =
  createState<AddMenuItemInsertionContext | null>({
    key: 'addMenuItemInsertionContextStateV2',
    defaultValue: null,
  });
