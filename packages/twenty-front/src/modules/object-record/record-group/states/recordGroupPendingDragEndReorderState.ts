import { type OnDragEndResponder } from '@hello-pangea/dnd';

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const recordGroupPendingDragEndReorderState =
  createAtomState<Parameters<OnDragEndResponder> | null>({
    key: 'recordGroupPendingDragEndReorderState',
    defaultValue: null,
  });
