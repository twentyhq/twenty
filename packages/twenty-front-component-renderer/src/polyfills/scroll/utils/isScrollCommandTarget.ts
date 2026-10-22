import { REMOTE_RENDER_CONTAINER_TAG } from '@/constants/RemoteRenderContainerTag';
import { isElementUnderRemoteRoot } from '@/polyfills/geometry/utils/isElementUnderRemoteRoot';

export const isScrollCommandTarget = ({
  element,
  rootElement,
}: {
  element: object;
  rootElement: object | null;
}): boolean =>
  element !== rootElement &&
  Reflect.get(element, 'localName') !== REMOTE_RENDER_CONTAINER_TAG &&
  isElementUnderRemoteRoot(element, rootElement);
