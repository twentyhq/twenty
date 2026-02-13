import { atom } from 'recoil';

import type { AddMenuItemInsertionContext } from '@/navigation-menu-item/types/AddMenuItemInsertionContext';

export const addMenuItemInsertionContextState =
  atom<AddMenuItemInsertionContext | null>({
    key: 'addMenuItemInsertionContextState',
    default: null,
  });
