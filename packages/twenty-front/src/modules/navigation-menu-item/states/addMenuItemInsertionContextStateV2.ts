import type { AddMenuItemInsertionContext } from '@/navigation-menu-item/types/AddMenuItemInsertionContext';

import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const addMenuItemInsertionContextStateV2 =
  createStateV2<AddMenuItemInsertionContext | null>({
    key: 'addMenuItemInsertionContextStateV2',
    defaultValue: null,
  });
