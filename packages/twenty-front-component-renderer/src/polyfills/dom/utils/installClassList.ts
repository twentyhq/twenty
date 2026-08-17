import { isDefined } from 'twenty-shared/utils';

import { type ElementWithClassAttribute } from '@/polyfills/dom/types/ElementWithClassAttribute';
import { type WorkerClassTokenList } from '@/polyfills/dom/types/WorkerClassTokenList';
import { createClassTokenList } from '@/polyfills/dom/utils/createClassTokenList';

export const installClassList = (elementPrototype: object): void => {
  const classTokenListByElement = new WeakMap<
    ElementWithClassAttribute,
    WorkerClassTokenList
  >();

  const resolveClassTokenList = (
    element: ElementWithClassAttribute,
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
    get(this: ElementWithClassAttribute) {
      return resolveClassTokenList(this);
    },
    set(this: ElementWithClassAttribute, newValue: unknown) {
      resolveClassTokenList(this).value = String(newValue);
    },
    configurable: true,
  });
};
