import { isDefined } from 'twenty-shared/utils';

import { type ElementWithAttributes } from '@/polyfills/dom/types/ElementWithAttributes';
import { type WorkerClassTokenList } from '@/polyfills/dom/types/WorkerClassTokenList';
import { createClassTokenList } from '@/polyfills/dom/utils/createClassTokenList';

type InstallClassAttributeAccessorsInput = {
  elementPrototype: object;
  remoteElementPrototypes: object[];
};

export const installClassAttributeAccessors = ({
  elementPrototype,
  remoteElementPrototypes,
}: InstallClassAttributeAccessorsInput): void => {
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

  const readClassName = (element: ElementWithAttributes): string =>
    element.getAttribute('class') ?? '';

  const defineClassAttributeAccessor = (
    prototype: object,
    propertyName: 'className' | 'classList',
    read: (element: ElementWithAttributes) => unknown,
  ): void => {
    const throwOnPrototypeAccess = (accessedObject: unknown): void => {
      if (accessedObject === prototype) {
        throw new TypeError('Illegal invocation');
      }
    };

    Object.defineProperty(prototype, propertyName, {
      get(this: ElementWithAttributes) {
        throwOnPrototypeAccess(this);

        return read(this);
      },
      set(this: ElementWithAttributes, newValue: unknown) {
        throwOnPrototypeAccess(this);

        if (!isDefined(newValue)) {
          this.removeAttribute('class');

          return;
        }

        this.setAttribute('class', String(newValue));
      },
      configurable: true,
    });
  };

  defineClassAttributeAccessor(
    elementPrototype,
    'classList',
    resolveClassTokenList,
  );

  for (const prototype of [elementPrototype, ...remoteElementPrototypes]) {
    defineClassAttributeAccessor(prototype, 'className', readClassName);
  }
};
