import { type OnDragEndResponder } from '@hello-pangea/dnd';
import { atom } from 'recoil';

export const recordGroupPendingDragEndReorderState =
  atom<Parameters<OnDragEndResponder> | null>({
    key: 'recordGroupPendingDragEndReorderState',
    default: null,
  });
