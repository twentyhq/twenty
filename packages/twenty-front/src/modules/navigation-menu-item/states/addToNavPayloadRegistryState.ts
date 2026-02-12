import { atom } from 'recoil';

import type { AddToNavigationDragPayload } from '@/navigation-menu-item/types/add-to-navigation-drag-payload';

export const addToNavPayloadRegistryState = atom<
  Map<string, AddToNavigationDragPayload>
>({
  key: 'navigation-menu-item/addToNavPayloadRegistryState',
  default: new Map(),
});
