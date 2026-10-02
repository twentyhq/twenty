import { isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type ElementWithAttributeNames } from '@/polyfills/dom/types/ElementWithAttributeNames';
import { convertDataAttributeNameToDatasetProperty } from '@/polyfills/dom/utils/convertDataAttributeNameToDatasetProperty';
import { convertDatasetPropertyToDataAttributeName } from '@/polyfills/dom/utils/convertDatasetPropertyToDataAttributeName';
import { isDatasetAttributeName } from '@/polyfills/dom/utils/isDatasetAttributeName';

export const createElementDataset = (
  element: ElementWithAttributeNames,
): DOMStringMap => {
  const readDatasetValue = (property: string): string | undefined =>
    element.getAttribute(convertDatasetPropertyToDataAttributeName(property)) ??
    undefined;

  return new Proxy<DOMStringMap>(
    {},
    {
      get: (target, property, receiver) =>
        (isString(property) ? readDatasetValue(property) : undefined) ??
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
        (isString(property) && isDefined(readDatasetValue(property))) ||
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
      ownKeys: () =>
        element
          .getAttributeNames()
          .filter(isDatasetAttributeName)
          .map(convertDataAttributeNameToDatasetProperty),
      getOwnPropertyDescriptor: (target, property) => {
        const value = isString(property)
          ? readDatasetValue(property)
          : undefined;

        return isDefined(value)
          ? { value, writable: true, enumerable: true, configurable: true }
          : Reflect.getOwnPropertyDescriptor(target, property);
      },
    },
  );
};
