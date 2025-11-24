import { type VirtualElement } from '@floating-ui/react';

export const createVirtualElementFromContainerOffset = (
  container: Element,
  offsetLeft: number,
  offsetTop: number,
): VirtualElement => {
  return {
    getBoundingClientRect: () => {
      const rect = container.getBoundingClientRect();
      const left = rect.left + offsetLeft;
      const top = rect.top + offsetTop;
      return new DOMRect(left, top, 1, 1);
    },
  };
};
