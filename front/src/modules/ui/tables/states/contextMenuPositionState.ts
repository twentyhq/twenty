import { atom } from 'recoil';

import { PositionType } from '@/ui/types/PositionType';

export const contextMenuPositionState = atom<PositionType>({
  key: 'contextMenuPositionState',
  default: {
    x: null,
    y: null,
  },
});
