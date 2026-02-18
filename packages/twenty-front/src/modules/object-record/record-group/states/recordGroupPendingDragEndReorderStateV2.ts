import { type OnDragEndResponder } from '@hello-pangea/dnd';

import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const recordGroupPendingDragEndReorderStateV2 =
  createStateV2<Parameters<OnDragEndResponder> | null>({
    key: 'recordGroupPendingDragEndReorderStateV2',
    defaultValue: null,
  });
