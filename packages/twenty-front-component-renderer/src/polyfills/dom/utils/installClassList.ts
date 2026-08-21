import { isDefined } from 'twenty-shared/utils';

import { type ClassAttributeTargetElement } from '@/polyfills/dom/types/ClassAttributeTargetElement';
import { type WorkerClassTokenList } from '@/polyfills/dom/types/WorkerClassTokenList';
import { createClassTokenList } from '@/polyfills/dom/utils/createClassTokenList';
import { throwOnPrototypeReceiver } from '@/polyfills/utils/throwOnPrototypeReceiver';

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
      throwOnPrototypeReceiver(this, elementPrototype);

      return resolveClassTokenList(this);
    },
    set(this: ClassAttributeTargetElement, newValue: unknown) {
      throwOnPrototypeReceiver(this, elementPrototype);

      this.setAttribute('class', String(newValue));
    },
    configurable: true,
  });
};
