import { type ClassAttributeTargetElement } from '@/polyfills/dom/types/ClassAttributeTargetElement';

// Only reaches base elements: remote elements define their own className
// accessor closer on the prototype chain, backed by the remote property
export const installClassName = (elementPrototype: object): void => {
  Object.defineProperty(elementPrototype, 'className', {
    get(this: ClassAttributeTargetElement) {
      return this.getAttribute('class') ?? '';
    },
    set(this: ClassAttributeTargetElement, newValue: unknown) {
      this.setAttribute('class', String(newValue));
    },
    configurable: true,
  });
};
