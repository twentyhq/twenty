import { type ClassAttributeTargetElement } from '@/polyfills/dom/types/ClassAttributeTargetElement';
import { throwOnPrototypeReceiver } from '@/polyfills/utils/throwOnPrototypeReceiver';

// Only reaches base elements: remote elements define their own className
// accessor closer on the prototype chain, backed by the remote property
export const installClassName = (elementPrototype: object): void => {
  Object.defineProperty(elementPrototype, 'className', {
    get(this: ClassAttributeTargetElement) {
      throwOnPrototypeReceiver(this, elementPrototype);

      return this.getAttribute('class') ?? '';
    },
    set(this: ClassAttributeTargetElement, newValue: unknown) {
      throwOnPrototypeReceiver(this, elementPrototype);

      this.setAttribute('class', String(newValue));
    },
    configurable: true,
  });
};
