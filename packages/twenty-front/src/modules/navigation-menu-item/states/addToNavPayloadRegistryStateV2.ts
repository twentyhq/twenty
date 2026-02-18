import type { AddToNavigationDragPayload } from '@/navigation-menu-item/types/add-to-navigation-drag-payload';

import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const addToNavPayloadRegistryStateV2 = createStateV2<
  Map<string, AddToNavigationDragPayload>
>({
  key: 'navigation-menu-item/addToNavPayloadRegistryStateV2',
  defaultValue: new Map(),
});
