import { isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { createStyleProxy } from '@/polyfills/dom/utils/createStyleProxy';

export const installLocalStyleOnBaseElements = (
  elementPrototype: object,
): void => {
  const localStyleDeclarations = new WeakMap<object, Record<string, unknown>>();

  const resolveLocalStyleDeclaration = (
    element: object,
  ): Record<string, unknown> => {
    const existingDeclaration = localStyleDeclarations.get(element);

    if (isDefined(existingDeclaration)) {
      return existingDeclaration;
    }

    const declaration = createStyleProxy();
    localStyleDeclarations.set(element, declaration);

    return declaration;
  };

  Object.defineProperty(elementPrototype, 'style', {
    get(this: object) {
      return resolveLocalStyleDeclaration(this);
    },
    set(this: object, value: unknown) {
      if (isString(value)) {
        resolveLocalStyleDeclaration(this).cssText = value;
      }
    },
    configurable: true,
  });
};
