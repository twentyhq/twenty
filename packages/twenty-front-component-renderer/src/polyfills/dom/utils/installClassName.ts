import { type ElementWithAttributes } from '@/polyfills/dom/types/ElementWithAttributes';
import { throwOnPrototypeAccess } from '@/polyfills/utils/throwOnPrototypeAccess';

// Only reaches base elements: remote elements define their own className
// accessor closer on the prototype chain, backed by the remote property
export const installClassName = (elementPrototype: object): void => {
  Object.defineProperty(elementPrototype, 'className', {
    get(this: ElementWithAttributes) {
      throwOnPrototypeAccess(this, elementPrototype);

      return this.getAttribute('class') ?? '';
    },
    set(this: ElementWithAttributes, newValue: unknown) {
      throwOnPrototypeAccess(this, elementPrototype);

      this.setAttribute('class', String(newValue));
    },
    configurable: true,
  });
};
