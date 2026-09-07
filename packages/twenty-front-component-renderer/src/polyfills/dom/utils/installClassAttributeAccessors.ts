import { isDefined } from 'twenty-shared/utils';

import { type ElementWithAttributes } from '@/polyfills/dom/types/ElementWithAttributes';
import { type WorkerClassTokenList } from '@/polyfills/dom/types/WorkerClassTokenList';
import { createClassTokenList } from '@/polyfills/dom/utils/createClassTokenList';

export const installClassAttributeAccessors = (
  elementPrototype: object,
): void => {
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

  // Reading an attribute-backed accessor off the prototype itself would
  // materialize the polyfill attribute map on the prototype, where every
  // element created afterwards would then share it
  const throwOnPrototypeAccess = (accessedObject: unknown): void => {
    if (accessedObject === elementPrototype) {
      throw new TypeError('Illegal invocation');
    }
  };

  const defineClassAttributeAccessor = (
    propertyName: 'className' | 'classList',
    read: (element: ElementWithAttributes) => unknown,
  ): void => {
    Object.defineProperty(elementPrototype, propertyName, {
      get(this: ElementWithAttributes) {
        throwOnPrototypeAccess(this);

        return read(this);
      },
      set(this: ElementWithAttributes, newValue: unknown) {
        throwOnPrototypeAccess(this);

        this.setAttribute('class', String(newValue));
      },
      configurable: true,
    });
  };

  // className only reaches base elements: remote elements define their own
  // accessor closer on the prototype chain, backed by the remote property
  defineClassAttributeAccessor(
    'className',
    (element) => element.getAttribute('class') ?? '',
  );
  defineClassAttributeAccessor('classList', resolveClassTokenList);
};
