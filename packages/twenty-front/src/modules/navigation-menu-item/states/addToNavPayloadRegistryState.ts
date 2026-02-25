import type { AddToNavigationDragPayload } from '@/navigation-menu-item/types/add-to-navigation-drag-payload';

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const addToNavPayloadRegistryState = createAtomState<
  Map<string, AddToNavigationDragPayload>
>({
  key: 'navigation-menu-item/addToNavPayloadRegistryState',
  defaultValue: new Map(),
});
