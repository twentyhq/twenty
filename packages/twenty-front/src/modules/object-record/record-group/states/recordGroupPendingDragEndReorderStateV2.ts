import { type OnDragEndResponder } from '@hello-pangea/dnd';

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const recordGroupPendingDragEndReorderStateV2 =
  createAtomState<Parameters<OnDragEndResponder> | null>({
    key: 'recordGroupPendingDragEndReorderStateV2',
    defaultValue: null,
  });
