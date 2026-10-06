import { isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type ElementWithAttributeNames } from '@/polyfills/dom/types/ElementWithAttributeNames';
import { convertDatasetPropertyToDataAttributeName } from '@/polyfills/dom/utils/convertDatasetPropertyToDataAttributeName';
import { listElementDatasetProperties } from '@/polyfills/dom/utils/listElementDatasetProperties';
import { readElementDatasetValue } from '@/polyfills/dom/utils/readElementDatasetValue';

export const createElementDataset = (
  element: ElementWithAttributeNames,
): DOMStringMap =>
  new Proxy<DOMStringMap>(
    {},
    {
      get: (target, property, receiver) =>
        readElementDatasetValue({ element, property }) ??
        Reflect.get(target, property, receiver),
      set: (target, property, value, receiver) => {
        if (!isString(property)) {
          return Reflect.set(target, property, value, receiver);
        }

        element.setAttribute(
          convertDatasetPropertyToDataAttributeName(property),
          String(value),
        );

        return true;
      },
      has: (target, property) =>
        isDefined(readElementDatasetValue({ element, property })) ||
        Reflect.has(target, property),
      deleteProperty: (target, property) => {
        if (!isString(property)) {
          return Reflect.deleteProperty(target, property);
        }

        element.removeAttribute(
          convertDatasetPropertyToDataAttributeName(property),
        );

        return true;
      },
      ownKeys: () => listElementDatasetProperties(element),
      getOwnPropertyDescriptor: (target, property) => {
        const datasetValue = readElementDatasetValue({ element, property });

        if (!isDefined(datasetValue)) {
          return Reflect.getOwnPropertyDescriptor(target, property);
        }

        return {
          value: datasetValue,
          writable: true,
          enumerable: true,
          configurable: true,
        };
      },
    },
  );
