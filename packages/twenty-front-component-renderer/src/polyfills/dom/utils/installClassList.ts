import { isDefined } from 'twenty-shared/utils';

import { type ClassListTargetElement } from '@/polyfills/dom/types/ClassListTargetElement';
import { type WorkerClassTokenList } from '@/polyfills/dom/types/WorkerClassTokenList';
import { createClassTokenList } from '@/polyfills/dom/utils/createClassTokenList';

export const installClassList = (elementPrototype: object): void => {
  const classTokenListByElement = new WeakMap<
    ClassListTargetElement,
    WorkerClassTokenList
  >();

  const resolveClassTokenList = (
    element: ClassListTargetElement,
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
    get(this: ClassListTargetElement) {
      return resolveClassTokenList(this);
    },
    set(this: ClassListTargetElement, newValue: unknown) {
      resolveClassTokenList(this).value = String(newValue);
    },
    configurable: true,
  });
};
