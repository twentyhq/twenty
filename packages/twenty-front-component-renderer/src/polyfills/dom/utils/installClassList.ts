import { isDefined } from 'twenty-shared/utils';

import { type ElementWithAttributes } from '@/polyfills/dom/types/ElementWithAttributes';
import { type WorkerClassTokenList } from '@/polyfills/dom/types/WorkerClassTokenList';
import { createClassTokenList } from '@/polyfills/dom/utils/createClassTokenList';
import { throwOnPrototypeAccess } from '@/polyfills/utils/throwOnPrototypeAccess';

export const installClassList = (elementPrototype: object): void => {
  const classTokenListByElement = new WeakMap<
    ElementWithAttributes,
    WorkerClassTokenList
  >();

  const resolveClassTokenList = (
    element: ElementWithAttributes,
  ): WorkerClassTokenList => {
    const existingClassTokenList = classTokenListByElement.get(element);

    if (isDefined(existingClassTokenList)) {
      return existingClassTokenList;
    }

    const createdClassTokenList = createClassTokenList(element);
    classTokenListByElement.set(element, createdClassTokenList);

    return createdClassTokenList;
  };

  Object.defineProperty(elementPrototype, 'classList', {
    get(this: ElementWithAttributes) {
      throwOnPrototypeAccess(this, elementPrototype);

      return resolveClassTokenList(this);
    },
    set(this: ElementWithAttributes, newValue: unknown) {
      throwOnPrototypeAccess(this, elementPrototype);

      this.setAttribute('class', String(newValue));
    },
    configurable: true,
  });
};
