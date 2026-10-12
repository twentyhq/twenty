import { type ScrolledElementPosition } from '@/types/ScrolledElementPosition';

export const readScrolledElementPosition = ({
  node,
  remoteElementId,
}: {
  node: Element;
  remoteElementId: string;
}): ScrolledElementPosition => ({
  remoteElementId,
  scrollTop: node.scrollTop,
  scrollLeft: node.scrollLeft,
});
