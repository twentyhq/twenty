import { isDefined } from 'twenty-shared/utils';

import { createLocalStyleDeclaration } from '@/polyfills/dom/utils/createLocalStyleDeclaration';

export const installLocalStyleOnBaseElements = (
  elementPrototype: object,
): void => {
  const localStyleDeclarations = new WeakMap<object, Record<string, unknown>>();

  Object.defineProperty(elementPrototype, 'style', {
    get(this: object) {
      const existingDeclaration = localStyleDeclarations.get(this);

      if (isDefined(existingDeclaration)) {
        return existingDeclaration;
      }

      const declaration = createLocalStyleDeclaration();
      localStyleDeclarations.set(this, declaration);

      return declaration;
    },
    set() {},
    configurable: true,
  });
};
