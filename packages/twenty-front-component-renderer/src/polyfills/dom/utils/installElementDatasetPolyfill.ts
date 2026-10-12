import { isDefined } from 'twenty-shared/utils';

import { type ElementWithAttributeNames } from '@/polyfills/dom/types/ElementWithAttributeNames';
import { createElementDataset } from '@/polyfills/dom/utils/createElementDataset';

export const installElementDatasetPolyfill = (
  elementPrototype: object,
): void => {
  if ('dataset' in elementPrototype) {
    return;
  }

  const datasetByElement = new WeakMap<
    ElementWithAttributeNames,
    DOMStringMap
  >();

  Object.defineProperty(elementPrototype, 'dataset', {
    get(this: ElementWithAttributeNames): DOMStringMap {
      if (this === elementPrototype) {
        throw new TypeError('Illegal invocation');
      }

      const existingDataset = datasetByElement.get(this);

      if (isDefined(existingDataset)) {
        return existingDataset;
      }

      const createdDataset = createElementDataset(this);
      datasetByElement.set(this, createdDataset);

      return createdDataset;
    },
    configurable: true,
  });
};
