import type { AddToNavigationDragPayload } from '@/navigation-menu-item/types/add-to-navigation-drag-payload';

import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const addToNavPayloadRegistryStateV2 = createState<
  Map<string, AddToNavigationDragPayload>
>({
  key: 'navigation-menu-item/addToNavPayloadRegistryStateV2',
  defaultValue: new Map(),
});
