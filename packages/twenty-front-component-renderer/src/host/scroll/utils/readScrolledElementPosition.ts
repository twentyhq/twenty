import { type ScrolledElementPosition } from '@/types/ScrolledElementPosition';

export const readScrolledElementPosition = ({
  node,
  remoteElementId,
}: {
  node: Pick<Element, 'scrollTop' | 'scrollLeft'>;
  remoteElementId: string;
}): ScrolledElementPosition => ({
  remoteElementId,
  scrollTop: node.scrollTop,
  scrollLeft: node.scrollLeft,
});
