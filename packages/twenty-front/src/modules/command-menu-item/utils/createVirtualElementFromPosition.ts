import { type PositionType } from '@/command-menu-item/types/PositionType';

export const createVirtualElementFromPosition = ({ x, y }: PositionType) => {
  return {
    getBoundingClientRect: () => {
      return new DOMRect(x ?? 0, y ?? 0, 0, 0);
    },
  };
};
