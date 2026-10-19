import { isDefined } from 'twenty-shared/utils';

import { type ElementLike } from '@/polyfills/dom/types/ElementLike';
import { isElementNode } from '@/polyfills/dom/utils/isElementNode';
import { type WorkerGeometryStore } from '@/polyfills/geometry/types/WorkerGeometryStore';

export const hasMeasuredChildElement = ({
  element,
  geometryStore,
}: {
  element: ElementLike;
  geometryStore: WorkerGeometryStore;
}): boolean => {
  const childNodes = element.childNodes;

  if (!isDefined(childNodes)) {
    return false;
  }

  return Array.from(childNodes).some(
    (childNode) =>
      isElementNode(childNode) && geometryStore.isElementMeasured(childNode),
  );
};
