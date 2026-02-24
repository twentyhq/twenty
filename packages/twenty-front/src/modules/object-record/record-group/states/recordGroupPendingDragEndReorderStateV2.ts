import { type OnDragEndResponder } from '@hello-pangea/dnd';

import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const recordGroupPendingDragEndReorderStateV2 =
  createState<Parameters<OnDragEndResponder> | null>({
    key: 'recordGroupPendingDragEndReorderStateV2',
    defaultValue: null,
  });
