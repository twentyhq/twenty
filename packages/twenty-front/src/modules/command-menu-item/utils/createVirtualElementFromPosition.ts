import { type PositionType } from '@/command-menu-item/types/PositionType';

export const createVirtualElementFromPosition = ({ x, y }: PositionType) => ({
  getBoundingClientRect: () => new DOMRect(x ?? 0, y ?? 0, 0, 0),
});
