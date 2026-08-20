import { isDefined } from 'twenty-shared/utils';

import { type ClassAttributeTargetElement } from '@/polyfills/dom/types/ClassAttributeTargetElement';
import { type WorkerClassTokenList } from '@/polyfills/dom/types/WorkerClassTokenList';
import { createClassTokenList } from '@/polyfills/dom/utils/createClassTokenList';

export const installClassList = (elementPrototype: object): void => {
  const classTokenListByElement = new WeakMap<
    ClassAttributeTargetElement,
    WorkerClassTokenList
  >();

  const resolveClassTokenList = (
    element: ClassAttributeTargetElement,
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
    get(this: ClassAttributeTargetElement) {
      return resolveClassTokenList(this);
    },
    set(this: ClassAttributeTargetElement, newValue: unknown) {
      resolveClassTokenList(this).value = String(newValue);
    },
    configurable: true,
  });
};
